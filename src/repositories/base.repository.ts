import { QueryResult } from 'pg';
import database from '../config/database';
import { BaseEntity, DatabaseError } from '../types';

export abstract class BaseRepository<T extends BaseEntity> {
    protected tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    async findById(id: number): Promise<T | null> {
        try {
            const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
            const result: QueryResult<T> = await database.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            throw new DatabaseError(`Error finding ${this.tableName} by id: ${error}`);
        }
    }

    async findOne(conditions: Partial<T>): Promise<T | null> {
        try {
            const keys = Object.keys(conditions);
            const values = Object.values(conditions);
            const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');

            const query = `SELECT * FROM ${this.tableName} WHERE ${whereClause} LIMIT 1`;
            const result: QueryResult<T> = await database.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            throw new DatabaseError(`Error finding ${this.tableName}: ${error}`);
        }
    }

    async findAll(conditions?: Partial<T>): Promise<T[]> {
        try {
            let query = `SELECT * FROM ${this.tableName}`;
            const values: any[] = [];

            if (conditions && Object.keys(conditions).length > 0) {
                const keys = Object.keys(conditions);
                const whereClause = keys
                    .map((key, index) => `${key} = $${index + 1}`)
                    .join(' AND ');
                query += ` WHERE ${whereClause}`;
                values.push(...Object.values(conditions));
            }

            const result: QueryResult<T> = await database.query(query, values);
            return result.rows;
        } catch (error) {
            throw new DatabaseError(`Error finding all ${this.tableName}: ${error}`);
        }
    }

    async create(data: Omit<T, 'id' | 'created_at'>): Promise<T> {
        try {
            const keys = Object.keys(data);
            const values = Object.values(data);
            const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
            const columns = keys.join(', ');

            const query = `
                INSERT INTO ${this.tableName} (${columns})
                VALUES (${placeholders})
                RETURNING *
            `;

            const result: QueryResult<T> = await database.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw new DatabaseError(`Error creating ${this.tableName}: ${error}`);
        }
    }

    async update(id: number, data: Partial<T>): Promise<T> {
        try {
            const keys = Object.keys(data);
            const values = Object.values(data);
            const setClause = keys
                .map((key, index) => `${key} = $${index + 1}`)
                .join(', ');

            const query = `
                UPDATE ${this.tableName}
                SET ${setClause}
                WHERE id = $${values.length + 1}
                RETURNING *
            `;

            const result: QueryResult<T> = await database.query(query, [...values, id]);

            if (!result.rowCount) {
                throw new DatabaseError(`${this.tableName} with id ${id} not found`);
            }

            return result.rows[0];
        } catch (error) {
            throw new DatabaseError(`Error updating ${this.tableName}: ${error}`);
        }
    }

    async delete(id: number): Promise<boolean> {
        try {
            const query = `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id`;
            const result = await database.query(query, [id]);
            return Boolean(result.rowCount);
        } catch (error) {
            throw new DatabaseError(`Error deleting ${this.tableName}: ${error}`);
        }
    }

    async count(conditions?: Partial<T>): Promise<number> {
        try {
            let query = `SELECT COUNT(*) FROM ${this.tableName}`;
            const values: any[] = [];

            if (conditions && Object.keys(conditions).length > 0) {
                const keys = Object.keys(conditions);
                const whereClause = keys
                    .map((key, index) => `${key} = $${index + 1}`)
                    .join(' AND ');
                query += ` WHERE ${whereClause}`;
                values.push(...Object.values(conditions));
            }

            const result = await database.query(query, values);
            return parseInt(result.rows[0].count);
        } catch (error) {
            throw new DatabaseError(`Error counting ${this.tableName}: ${error}`);
        }
    }
}