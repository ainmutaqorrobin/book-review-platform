import pool from "../config/db";
import { hash } from "bcrypt";
import { Role, User } from "./type";

export const createUser = async (
  username: string,
  password: string,
  name: string,
  role: Role = Role.USER
): Promise<User> => {
  const password_hash = await hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (username, password_hash, name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, name, role, created_at`,
    [username, password_hash, name, role]
  );

  return result.rows[0];
};

export const findUserByUsername = async (
  username: string
): Promise<User | null> => {
  const result = await pool.query(`SELECT * FROM users WHERE username = $1`, [
    username,
  ]);

  if (result.rows.length === 0) return null;

  return result.rows[0];
};

export const findUserById = async (id: number): Promise<User | null> => {
  const result = await pool.query(
    `SELECT id, username, name, role, created_at 
     FROM users
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
};
