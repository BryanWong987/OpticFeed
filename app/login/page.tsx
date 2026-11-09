import Link from "next/link";
import pool from '@/app/lib/db';
import { revalidatePath } from 'next/cache';
import SignupForm from '../components/signup-form';
import LoginForm from '../components/login-form';
import mysql, { RowDataPacket } from "mysql2/promise";

interface Account extends RowDataPacket {
  user_id: number;
  username: string;
  email: string;
  password: string;
  preferences: string;
  img_path: string;
}

export default async function ItemsPage() {
  
  // Fetch data
  // const [accounts] = await connection.query<Account[]>('SELECT * FROM accounts;');


  // conn.query<RowDataPacket[]>(
  //   'SELECT 1 + 1 AS test, 2 + 2 AS test;',
  //   (_err, rows) => {
  //     console.log(rows);
  //     /**
  //      * @rows: [ [ 2, 4 ] ]
  //      */
  //   }
  // );


  // async function resetTable() {
  //   'use server';
  //   db.prepare('DELETE FROM accounts').run();
  //   revalidatePath('/login');
  // }

  // async function resetDatabase() {
  //   'use server';
  //   db.exec('DROP TABLE accounts')

  //   db.exec(`
  //       CREATE TABLE IF NOT EXISTS accounts (
  //           id INTEGER PRIMARY KEY AUTOINCREMENT,
  //           username TEXT NOT NULL UNIQUE,
  //           email TEXT NOT NULL UNIQUE,
  //           password TEXT NOT NULL,
  //           role TEXT
  //       )
  //       `);
  //   // db.close();
  // }

  return (
    <main className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-8 md:grid-cols-2">

        <LoginForm />
        
        <SignupForm />

      </div>

      {/* <ul className="flex-col box-border border-3">
        {accounts.map((account) => (
          <li key={account.user_id}>{account.user_id} {account.username} {account.email} {account.password.slice(0, 10)}</li>
        ))}
      </ul> */}

      {/* <h1>Accounts</h1>

      {accounts.length === 0 ? (
        <p>No accounts found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
            </tr>
          </thead>

          <tbody>
            {accounts.map((account) => (
              <tr key={account.user_id}>
                <td>{account.user_id}</td>
                <td>{account.username}</td>
                <td>{account.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )} */}

      {/* <form action={resetTable} className="mb-4 flex gap-2">
        <button type="submit" className="bg-red-500 text-white p-1 px-3">Reset Table</button>
      </form>

      <form action={resetDatabase} className="mb-4 flex gap-2">
        <button type="submit" className="bg-red-500 text-white p-1 px-3">(DEV) Reset Database</button>
      </form> */}

    </main>
  );
}