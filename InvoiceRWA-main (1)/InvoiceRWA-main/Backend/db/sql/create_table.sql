CREATE TABLE USERS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50),
    password VARCHAR(50),
    access_permission ENUM('manager','staff')
);

CREATE TABLE EMPLOYEES (
    id VARCHAR(5) PRIMARY KEY,
    employee_name VARCHAR(100) NOT NULL,
    phone VARCHAR(10) NOT NULL,
    role ENUM('manager', 'staff') NOT NULL,
    status ENUM('active', 'inactive') NOT NULL,
    url MEDIUMBLOB,
    gender varchar(10),

    CONSTRAINT unique_phone UNIQUE(phone)
);

CREATE TABLE SHIFTS (
    id VARCHAR(2) PRIMARY KEY,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    CHECK (end_time > start_time)
);

CREATE TABLE ASSIGNMENTS (
    shift_id VARCHAR(2) NOT NULL,
    employee_id VARCHAR(5) NOT NULL,

    PRIMARY KEY (shift_id, employee_id),
    FOREIGN KEY (shift_id) REFERENCES SHIFTS(id),
    FOREIGN KEY (employee_id) REFERENCES EMPLOYEES(id)
);

CREATE TABLE ATTENDANCE (
    employee_id VARCHAR(5) NOT NULL,
    work_date DATE NOT NULL,
    shift_id VARCHAR(2),
    check_in TIME DEFAULT NULL,
    check_out TIME DEFAULT NULL,
    status ENUM('present', 'late'),

    PRIMARY KEY (employee_id, work_date, shift_id),
    FOREIGN KEY (shift_id, employee_id) REFERENCES ASSIGNMENTS(shift_id, employee_id),
    CHECK (check_out > check_in)
);

CREATE TABLE CUSTOMERS (
    id INT AUTO_INCREMENT,
    phone VARCHAR(10) NOT NULL UNIQUE,
    cus_name VARCHAR(100) NOT NULL,
    cus_level ENUM('normal','silver','gold','diamond') DEFAULT 'normal',
    cus_point INT DEFAULT 0,
    total_spent INT DEFAULT 0,
    PRIMARY KEY(id)
);

CREATE TABLE TABLES (
    id VARCHAR(2) PRIMARY KEY,
    status ENUM('free', 'busy') DEFAULT 'free'
);

CREATE TABLE ITEMS (
    id VARCHAR(5) PRIMARY KEY,
    i_name VARCHAR(50) NOT NULL UNIQUE,
    i_description VARCHAR(50) NOT NULL,
    i_category ENUM('MT','BA','CO') NOT NULL,
    i_status ENUM('active','inactive') DEFAULT 'active',
    url MEDIUMBLOB,
    mood ENUM('hot', 'cold')
);

CREATE TABLE ITEM_PRICES (
    item_id VARCHAR(5) NOT NULL,
    size VARCHAR(1) NOT NULL,
    price INT NOT NULL,
    PRIMARY KEY (item_id, size),
    FOREIGN KEY (item_id) REFERENCES ITEMS(id)
);

CREATE TABLE COMBOS (
    id VARCHAR(5) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    price INT NOT NULL
);

CREATE TABLE COMBO_ITEMS (
    combo_id VARCHAR(5) NOT NULL,
    item_id VARCHAR(5) NOT NULL,
    size VARCHAR(1) NOT NULL,
    PRIMARY KEY (combo_id, item_id),
    FOREIGN KEY (combo_id) REFERENCES COMBOS(id),
    FOREIGN KEY (item_id) REFERENCES ITEMS(id)
);

CREATE TABLE DISCOUNT_RULES (
    id INT AUTO_INCREMENT PRIMARY KEY,
    d_name VARCHAR(50) NOT NULL,
    customer_level ENUM('guest','normal','silver','gold','diamond') NOT NULL,
    min_value INT NOT NULL,
    discount_percent DECIMAL(10,2) NOT NULL
);

CREATE TABLE ORDERS (
    id VARCHAR(5) PRIMARY KEY,
    customer_id INT DEFAULT NULL,
    table_id VARCHAR(2) NOT NULL,
    subtotal INT DEFAULT 0,
    discount DECIMAL(10,2) NOT NULL,
    final_total INT DEFAULT 0,
    payment_status ENUM('pending','done') DEFAULT 'pending',
    created_date DATE DEFAULT (current_date()),
    created_time TIME DEFAULT (current_time()),
    bill_status ENUM('progress', 'done') DEFAULT 'progress',
    FOREIGN KEY (customer_id) REFERENCES CUSTOMERS(id),
    FOREIGN KEY (table_id) REFERENCES TABLES(id)
);

CREATE TABLE ORDER_ITEMS (
    order_id VARCHAR(5) NOT NULL,
    item_id VARCHAR(5) NOT NULL,
    size VARCHAR(1) NOT NULL,
    quantity INT NOT NULL,
    note VARCHAR(100) DEFAULT NULL,
    PRIMARY KEY (order_id, item_id),
    FOREIGN KEY (order_id) REFERENCES ORDERS(id),
    FOREIGN KEY (item_id) REFERENCES ITEMS(id)
);

CREATE TABLE INVENTORY (
    id VARCHAR(5) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit VARCHAR(10) NOT NULL,
    min_threshold DECIMAL(10,2) NOT NULL,
    max_threshold DECIMAL(10,2) NOT NULL,
    status ENUM('normal', 'low', 'out') DEFAULT 'normal',
    url MEDIUMBLOB,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE INVENTORY_IMPORTS (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ingredient_id VARCHAR(5) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    supplier VARCHAR(100),
    import_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    employee_id VARCHAR(5) NOT NULL,
    note TEXT,
    FOREIGN KEY (ingredient_id) REFERENCES INVENTORY(id),
    FOREIGN KEY (employee_id) REFERENCES EMPLOYEES(id)
);

CREATE TABLE ITEM_INGREDIENTS (
    item_id VARCHAR(5),
    ingredient_id VARCHAR(5),
    quantity_needed DECIMAL(10,3) NOT NULL,
    unit VARCHAR(10) NOT NULL,
    PRIMARY KEY (item_id, ingredient_id),
    FOREIGN KEY (item_id) REFERENCES ITEMS(id),
    FOREIGN KEY (ingredient_id) REFERENCES INVENTORY(id)
);
