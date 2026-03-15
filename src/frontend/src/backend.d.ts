import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
    role: UserRole;
}
export interface FacultyRequest {
    id: bigint;
    status: FacultyRequestStatus;
    timing: bigint;
    submittedAt: bigint;
    description: string;
    inTime?: bigint;
    facultyName: string;
    outTime?: bigint;
}
export enum FacultyRequestStatus {
    pending = "pending",
    approved = "approved",
    declined = "declined"
}
export enum UserRole {
    principal = "principal",
    security = "security",
    faculty = "faculty"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    getAllApprovedRequests(): Promise<Array<FacultyRequest>>;
    getAllRequests(): Promise<Array<FacultyRequest>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getPendingRequests(): Promise<Array<FacultyRequest>>;
    getRequest(requestId: bigint): Promise<FacultyRequest>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    recordFacultyInTime(requestId: bigint): Promise<void>;
    recordFacultyOutTime(requestId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitRequest(facultyName: string, description: string, timing: bigint): Promise<bigint>;
    updateRequestStatus(requestId: bigint, newStatus: FacultyRequestStatus): Promise<void>;
}
