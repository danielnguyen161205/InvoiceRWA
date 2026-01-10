import os
import hashlib
import tempfile
from typing import Tuple

_USE_S3 = os.getenv('S3_ENABLED', 'false').lower() in ('1', 'true', 'yes')

if _USE_S3:
    import boto3
    from botocore.client import Config


def _compute_sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()


def save_file(org_id: int, filename: str, fileobj, content_type: str) -> Tuple[str, str]:
    """
    Save uploaded file either to S3 (if configured) or to local storage.
    Returns (file_hash, storage_path)
    storage_path is S3 key when S3 used, or local path otherwise.
    """
    # write to a temp file to compute hash and upload
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        while True:
            chunk = fileobj.read(8192)
            if not chunk:
                break
            tmp.write(chunk)
        tmp_path = tmp.name

    file_hash = _compute_sha256_file(tmp_path)

    if _USE_S3:
        # read S3 config
        endpoint = os.getenv('S3_ENDPOINT_URL')
        access_key = os.getenv('S3_ACCESS_KEY')
        secret_key = os.getenv('S3_SECRET_KEY')
        bucket = os.getenv('S3_BUCKET')
        region = os.getenv('S3_REGION') or None
        use_ssl = os.getenv('S3_USE_SSL', 'true').lower() in ('1', 'true', 'yes')

        s3_config = Config(signature_version='s3v4')
        if endpoint:
            s3 = boto3.client('s3', aws_access_key_id=access_key, aws_secret_access_key=secret_key, endpoint_url=endpoint, config=s3_config, region_name=region, use_ssl=use_ssl)
        else:
            s3 = boto3.client('s3', aws_access_key_id=access_key, aws_secret_access_key=secret_key, region_name=region, config=s3_config)

        key = f"kyc/{org_id}/{file_hash}_{filename}"
        extra_args = {}
        if content_type:
            extra_args['ContentType'] = content_type

        s3.upload_file(tmp_path, bucket, key, ExtraArgs=extra_args)
        storage_path = f"s3://{bucket}/{key}"

        # remove tmp
        try:
            os.remove(tmp_path)
        except Exception:
            pass

        return file_hash, storage_path
    else:
        storage_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'storage')
        os.makedirs(storage_dir, exist_ok=True)
        org_dir = os.path.join(storage_dir, str(org_id))
        os.makedirs(org_dir, exist_ok=True)
        dest = os.path.join(org_dir, f"{file_hash}_{filename}")
        os.replace(tmp_path, dest)
        return file_hash, dest


def generate_presigned_url(storage_path: str, expires_in: int = 3600) -> str:
    """Return a presigned URL for S3 storage_path (s3://bucket/key) or local file path."""
    if _USE_S3:
        endpoint = os.getenv('S3_ENDPOINT_URL')
        access_key = os.getenv('S3_ACCESS_KEY')
        secret_key = os.getenv('S3_SECRET_KEY')
        region = os.getenv('S3_REGION') or None

        if not storage_path.startswith('s3://'):
            raise ValueError('storage_path is not an s3 path')

        _, rest = storage_path.split('s3://', 1)
        bucket, key = rest.split('/', 1)

        if endpoint:
            import boto3
            from botocore.client import Config
            s3 = boto3.client('s3', aws_access_key_id=access_key, aws_secret_access_key=secret_key, endpoint_url=endpoint, config=Config(signature_version='s3v4'), region_name=region)
        else:
            import boto3
            s3 = boto3.client('s3', aws_access_key_id=access_key, aws_secret_access_key=secret_key, region_name=region)

        url = s3.generate_presigned_url('get_object', Params={'Bucket': bucket, 'Key': key}, ExpiresIn=expires_in)
        return url
    else:
        # local: return file:// path
        return f"file://{os.path.abspath(storage_path)}"
