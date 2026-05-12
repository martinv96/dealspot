import { DataTypes} from "sequelize";

export default (sequelize) => {
    return sequelize.define("Report", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        annonce_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        motif: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        statut: {
            type: DataTypes.ENUM("en_attente", "traité", "rejeté"),
            defaultValue: "en_attente"
        }
    }, {
        tableName: "reports",
        timestamps: true
    
    });
};