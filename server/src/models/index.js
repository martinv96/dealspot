import { sequelize } from "../config/database.js";
import createUserModel from "./User.js";

export const User = createUserModel(sequelize);