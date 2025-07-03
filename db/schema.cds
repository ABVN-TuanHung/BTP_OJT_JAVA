namespace db;

@readonly
entity Roles {
    key ID: UUID;
    name: String(20);
    baseSalary: Integer;   
}

@readonly
entity Departments {
    key ID: UUID;
    name: String(50);
}

entity Employees {
    key ID: UUID;
    firstName: String(40);
    lastName: String(40);
    dateOfBirth: Date;
    gender: String(6);
    email: String(50);
    hireDate: Date;
    salary: Integer;
    role: Association to one Roles;
    department: Association to one Departments;
}