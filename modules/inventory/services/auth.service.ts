import ApiError from "../../../utils/ApiError";
import { generateToken } from "../../../utils/token.utils";
import { findUserByTrigram } from "../repository/auth.repository";
import { LoginBody } from "../validation/auth.validate";


export const loginTrigramService = async ({trigram,password}: LoginBody) => {

  const user = await findUserByTrigram(trigram);

  if (!user) {
    console.log("User Not Found.");
    throw new ApiError(404, "User Not Found.");
  }

  const isMatch = user.pwd === password;

  if (!isMatch) {
    console.log("Password mismatch");
    throw new ApiError(401, "Invalid Password.");
  }

  const permissions = user?.role.permissions.map(
    (ap: any) => ap.permission.action,
  );

  console.log("User: ", user);

  if (!user.warehouses || user.warehouses.length === 0) {
    console.log("No warehouse access assigned.");
    throw new ApiError(403, "No warehouse access assigned.");
  }

  const warehouses = user.warehouses.map((uw: any) => ({
    warehouseId: uw.warehouse.id,
    warehouseName: uw.warehouse.name,
    warehouseLocation: uw.warehouse.location,
    accessType: uw.accessType,
  }));

  console.log("User found: ", user);
  console.log("User permissions: ", permissions);

  const UserPayload = {
    id: user.id,
    type: "STAFF",
    role: user.role.name,
    permissions: permissions,
    trigram: user.trigram,
    gstin: null,
    warehouses: warehouses,
  };

  const token = generateToken(UserPayload);
  console.log("✅ User authenticated and authorized");
  return {
    message: "Success",
    user: UserPayload,
    token,
  };
};
