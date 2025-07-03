using {db as my} from '../db/schema';

@path    : '/OJT/EmpSrv'
@requires: 'authenticated-user'
@restrict: [
    {
        grant: 'READ',
        to   : 'Viewer'
    },
    {
        grant: '*',
        to   : 'Admin'
    }
]
service EmployeesService {
    entity Roles       as projection on my.Roles;
    entity Departments as projection on my.Departments;
    entity Employees   as projection on my.Employees;
}