import UserModel, { UserInput } from "./model";

export async function findOrCreateUser({ email, name, profilePic }: UserInput) {
	let user = await UserModel.findOne({ email });

	if (!user) {
		user = await UserModel.create({ email, name, profilePic });
	}

	return user;
}
