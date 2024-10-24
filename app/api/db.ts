import { ConnectionPool } from "mssql";

const config = {
    user: process.env.ECOM_USER as string,
    password: process.env.ECOM_PWD as string,
    server: process.env.ECOM_SERVER as string,
    database: process.env.ECOM_DB as string,
    options: {
        encrypt: true, // Use encryption
        enableArithAbort: true,
        trustServerCertificate: true
    }
};

export function executeQuery(query: string) {
    return new ConnectionPool(config)
        .connect()
        .then((pool) => {
            return pool.request().query(query);
        })
        .then((result) => {
            return result.recordset;
        })
        .catch((err) => {
            console.log(err);
        });
}