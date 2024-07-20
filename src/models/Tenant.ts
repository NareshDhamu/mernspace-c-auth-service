import mongoose, { Document, Schema } from "mongoose";

export interface ITenant extends Document {
    name: string;
    address: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

const TenantSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            maxlength: 100,
        },
        address: {
            type: String,
            required: true,
            maxlength: 255,
        },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    {
        timestamps: true,
    },
);

const Tenant = mongoose.model<ITenant>("Tenant", TenantSchema);
export default Tenant;
