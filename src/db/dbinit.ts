import connection from "./mysql.js";

const createStaffTableSql = `
CREATE TABLE IF NOT EXISTS staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    first_name NVARCHAR(100) NOT NULL,
    last_name NVARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address NVARCHAR(255),
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
`;

const createCustomerTableSql = `
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    first_name NVARCHAR(100) NOT NULL,
    last_name NVARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address NVARCHAR(255),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
`;
// const createCustomerTableSql = `
// CREATE TABLE IF NOT EXISTS customers (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     user_id INT UNIQUE,
//     first_name VARCHAR(255) NOT NULL,
//     last_name VARCHAR(255) NOT NULL,
//     email VARCHAR(255) NOT NULL UNIQUE,
//     phone VARCHAR(20),
//     address VARCHAR(255),
//     status ENUM('active', 'inactive') DEFAULT 'active',
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     CONSTRAINT fk_customers_user FOREIGN KEY (user_id) REFERENCES users(id)
// )
// `;



const initDatabase = (): void => {
    console.log("Connected to database");

    connection.query(createCustomerTableSql, (roleError) => {
        if (roleError) {
            console.log("Create roles table failed", roleError.message);
            return;
        }
        console.log("customer table ready");
    })


        connection.query(createStaffTableSql, (staffError) => {
            if (staffError) {
                console.log("Create staff table failed", staffError.message);
                return;
            }

            console.log("staff table ready");
        });

        // connection.query(createCustomerTableSql, (staffError) => {
        //     if (staffError) {
        //         console.log("Create staff table failed", staffError.message);
        //         return;
        //     }

        //     console.log("staff table ready");
        // });
    // });
};

export default initDatabase;
