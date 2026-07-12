import { randomUUID } from "node:crypto";
import { models } from "../models/index.js";

const normalize = (value) => (value && typeof value.toString === "function" ? value.toString() : value);
const matches = (item, filter = {}) => Object.entries(filter).every(([key, expected]) => {
  const value = item[key];
  if (Array.isArray(expected)) return expected.map(normalize).includes(normalize(value));
  return normalize(value) === normalize(expected);
});
const sortItems = (items, sort = {}) => {
  const [entry] = Object.entries(sort);
  const [key, direction] = entry || [];
  if (!key) return items;
  return [...items].sort((a, b) => (a[key] > b[key] ? 1 : -1) * (direction < 0 ? -1 : 1));
};

export class MemoryRepository {
  constructor() { this.mode = "memory"; this.data = Object.fromEntries(Object.keys(models).map((key) => [key, []])); }
  async getAll(collection, filter = {}, sort = {}) { return sortItems(this.data[collection].filter((item) => matches(item, filter)), sort); }
  async getById(collection, id) { return this.data[collection].find((item) => item.id === id) || null; }
  async getOne(collection, filter = {}) { return this.data[collection].find((item) => matches(item, filter)) || null; }
  async create(collection, data) { const item = { ...data, id: randomUUID(), created_at: new Date(), updated_at: new Date() }; this.data[collection].push(item); return item; }
  async updateById(collection, id, updates) { const item = await this.getById(collection, id); if (!item) return null; Object.assign(item, updates, { updated_at: new Date() }); return item; }
  async upsert(collection, filter, createData, updateData) { const current = await this.getOne(collection, filter); return current ? this.updateById(collection, current.id, updateData) : this.create(collection, { ...filter, ...createData }); }
  async deleteById(collection, id) { const index = this.data[collection].findIndex((item) => item.id === id); return index < 0 ? null : this.data[collection].splice(index, 1)[0]; }
  async deleteWhere(collection, filter) { const removed = this.data[collection].filter((item) => matches(item, filter)); this.data[collection] = this.data[collection].filter((item) => !matches(item, filter)); return removed.length; }
  async count(collection, filter = {}) { return (await this.getAll(collection, filter)).length; }
}

const toPlain = (document) => { if (!document) return null; const object = document.toObject ? document.toObject() : document; const { _id, __v, ...rest } = object; return { ...rest, id: String(_id || object.id) }; };
const toMongoFilter = (filter = {}) => Object.fromEntries(Object.entries(filter).map(([key, value]) => [key === "id" ? "_id" : key, value]));
export class MongoRepository {
  constructor() { this.mode = "mongo"; }
  model(collection) { if (!models[collection]) throw new Error(`Unknown collection: ${collection}`); return models[collection]; }
  async getAll(collection, filter = {}, sort = {}) { return (await this.model(collection).find(toMongoFilter(filter)).sort(sort).lean()).map(toPlain); }
  async getById(collection, id) { return toPlain(await this.model(collection).findById(id).lean()); }
  async getOne(collection, filter = {}) { return toPlain(await this.model(collection).findOne(toMongoFilter(filter)).lean()); }
  async create(collection, data) { return toPlain(await this.model(collection).create(data)); }
  async updateById(collection, id, updates) { return toPlain(await this.model(collection).findByIdAndUpdate(id, updates, { new: true }).lean()); }
  async upsert(collection, filter, createData, updateData) { return toPlain(await this.model(collection).findOneAndUpdate(toMongoFilter(filter), { $set: updateData, $setOnInsert: createData }, { upsert: true, new: true }).lean()); }
  async deleteById(collection, id) { return toPlain(await this.model(collection).findByIdAndDelete(id).lean()); }
  async deleteWhere(collection, filter) { return (await this.model(collection).deleteMany(toMongoFilter(filter))).deletedCount; }
  async count(collection, filter = {}) { return this.model(collection).countDocuments(toMongoFilter(filter)); }
}
