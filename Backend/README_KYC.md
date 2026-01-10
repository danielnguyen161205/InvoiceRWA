KYC Onboarding - Developer Notes

This document explains how the simple KYC onboarding flow implemented in the repo works and how to test it.

Endpoints (backend)
- POST /kyc/organizations -> create organization
- POST /kyc/organizations/{org_id}/upload -> upload a file (multipart/form-data: file, uploaded_by)
- POST /kyc/organizations/{org_id}/submit -> mark organization as UNDER_REVIEW
- POST /kyc/organizations/{org_id}/review -> reviewer approve/reject
- GET /kyc/registry/check?hash=... -> check registry

Testing via frontend dev server
1. Start backend (uvicorn app.main:app --reload)
2. Start frontend (npm start in Frontend/)
3. Open http://127.0.0.1:5500/pages/kyc-onboard.html
4. Create an organization, upload a document (file will be saved under Backend/storage/{org_id}/), and click Submit for review.

Notes
- The upload endpoint computes SHA256 on server side and stores file hash in DB. If an identical hash exists, registry entry will be marked with lien_flag=true.
- For production, move files to secure object storage (S3/MinIO) and implement proper ACLs and encryption.
- Implement audit log and evidence pack as next steps.
 - Storage: backend supports S3/MinIO. Configure via environment variables below.

S3 / MinIO configuration (env)
- S3_ENABLED=true
- S3_ENDPOINT_URL=https://play.min.io    # optional for MinIO or custom endpoint
- S3_ACCESS_KEY=your-access-key
- S3_SECRET_KEY=your-secret
- S3_BUCKET=your-bucket-name
- S3_REGION=us-east-1                    # optional
- S3_USE_SSL=true

When `S3_ENABLED` is true the server will upload files to `s3://{S3_BUCKET}/kyc/{org_id}/{file_hash}_{filename}` and return that path in storage metadata. If S3 is not enabled, files are stored under `Backend/storage/{org_id}/`.

Migration from local storage to S3
- If you previously stored files under `Backend/storage/` you can migrate them to S3 using the script:
	```
	cd Backend
	S3_ENABLED=true S3_ENDPOINT_URL=... S3_ACCESS_KEY=... S3_SECRET_KEY=... S3_BUCKET=... python scripts/migrate_storage_to_s3.py
	```
	The script looks for `Document` rows without `storage_path` and uploads matching local files to S3, then updates `Document.storage_path`.

Presigned download URLs
- The backend exposes `GET /kyc/documents/{doc_id}/download` which returns a presigned URL for S3-stored files (or `file://` path for local files). This endpoint requires authentication.
