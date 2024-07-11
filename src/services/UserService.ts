import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types";
import createHttpError from "http-errors";
import { Roles } from "../constants";
import bcrytp from "bcrypt";

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({ firstName, lastName, email, password }: UserData) {
        const user = await this.userRepository.findOne({
            where: { email: email },
        });
        if (user) {
            const err = createHttpError(400, "User Email already exists!");
            throw err;
        }

        const saltRounds = 10;
        const hashedPassword = await bcrytp.hash(password, saltRounds);
        try {
            const user = await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });
            return { ...user, id: user.id.toString() };
        } catch (err) {
            const error = createHttpError(
                500,
                "Failed to store the user in the database",
            );

            throw error;
        }
    }
}
