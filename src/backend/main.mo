import List "mo:core/List";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserRole = {
    #principal;
    #faculty;
    #security;
  };

  public type UserProfile = {
    name : Text;
    role : UserRole;
  };

  type FacultyRequestStatus = {
    #pending;
    #approved;
    #declined;
  };

  type FacultyRequest = {
    id : Nat;
    facultyName : Text;
    description : Text;
    timing : Nat;
    status : FacultyRequestStatus;
    submittedAt : Int;
    outTime : ?Int;
    inTime : ?Int;
  };

  var nextRequestId = 0;
  let facultyRequests = Map.empty<Nat, FacultyRequest>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  func getUserRole(caller : Principal) : ?UserRole {
    switch (userProfiles.get(caller)) {
      case (null) { null };
      case (?profile) { ?profile.role };
    };
  };

  public shared func submitRequest(facultyName : Text, description : Text, timing : Nat) : async Nat {
    if (timing != 1 and timing != 2) {
      Runtime.trap("Invalid timing. Must be 1 or 2 hours");
    };
    let requestId = nextRequestId;
    nextRequestId += 1;
    let newRequest : FacultyRequest = {
      id = requestId;
      facultyName;
      description;
      timing;
      status = #pending;
      submittedAt = Time.now();
      outTime = null;
      inTime = null;
    };
    facultyRequests.add(requestId, newRequest);
    requestId;
  };

  public shared func updateRequestStatus(requestId : Nat, newStatus : FacultyRequestStatus) : async () {
    switch (facultyRequests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?request) {
        let updatedRequest : FacultyRequest = {
          id = request.id;
          facultyName = request.facultyName;
          description = request.description;
          timing = request.timing;
          status = newStatus;
          submittedAt = request.submittedAt;
          outTime = request.outTime;
          inTime = request.inTime;
        };
        facultyRequests.add(requestId, updatedRequest);
      };
    };
  };

  public shared func recordFacultyOutTime(requestId : Nat) : async () {
    switch (facultyRequests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?request) {
        switch (request.status) {
          case (#approved) {
            let updatedRequest : FacultyRequest = {
              id = request.id;
              facultyName = request.facultyName;
              description = request.description;
              timing = request.timing;
              status = request.status;
              submittedAt = request.submittedAt;
              outTime = ?Time.now();
              inTime = request.inTime;
            };
            facultyRequests.add(requestId, updatedRequest);
          };
          case (_) { Runtime.trap("Request must be approved to record out time") };
        };
      };
    };
  };

  public shared func recordFacultyInTime(requestId : Nat) : async () {
    switch (facultyRequests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?request) {
        switch (request.status) {
          case (#approved) {
            let updatedRequest : FacultyRequest = {
              id = request.id;
              facultyName = request.facultyName;
              description = request.description;
              timing = request.timing;
              status = request.status;
              submittedAt = request.submittedAt;
              outTime = request.outTime;
              inTime = ?Time.now();
            };
            facultyRequests.add(requestId, updatedRequest);
          };
          case (_) { Runtime.trap("Request must be approved to record in time") };
        };
      };
    };
  };

  public query func getRequest(requestId : Nat) : async FacultyRequest {
    switch (facultyRequests.get(requestId)) {
      case (null) { Runtime.trap("Request does not exist") };
      case (?request) { request };
    };
  };

  public query func getAllRequests() : async [FacultyRequest] {
    facultyRequests.values().toArray();
  };

  public query func getAllApprovedRequests() : async [FacultyRequest] {
    getRequestsByStatus(#approved);
  };

  public query func getPendingRequests() : async [FacultyRequest] {
    getRequestsByStatus(#pending);
  };

  func getRequestsByStatus(status : FacultyRequestStatus) : [FacultyRequest] {
    facultyRequests.values().toArray().filter(
      func(request) { request.status == status }
    );
  };
};
