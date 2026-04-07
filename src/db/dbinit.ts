import connection from "./mysql.js";

const createRoleTableSql = `
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(30) NOT NULL UNIQUE
)
`;

const createStaffTableSql = `
CREATE TABLE IF NOT EXISTS staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role_id INT UNIQUE,
    status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_staff_role FOREIGN KEY (role_id) REFERENCES roles(id)
)
`;

const initDatabase = (): void => {
    console.log("Connected to database");

    connection.query(createRoleTableSql, (roleError) => {
        if (roleError) {
            console.log("Create roles table failed", roleError.message);
            return;
        }

        console.log("role table ready");

        connection.query(createStaffTableSql, (staffError) => {
            if (staffError) {
                console.log("Create staff table failed", staffError.message);
                return;
            }

            console.log("staff table ready");
        });
    });
};

export default initDatabase;
