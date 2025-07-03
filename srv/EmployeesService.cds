using {db as my} from '../db/schema';

@path    : '/OJT/EmpSrv'
service EmployeesService {
    entity Roles       as projection on my.Roles;
    entity Departments as projection on my.Departments;
    entity Employees   as projection on my.Employees;
}