package customer.ojt_jav.handler;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.sap.cds.feature.xsuaa.XsuaaUserInfo;
import com.sap.cds.ql.Select;
import com.sap.cds.services.authentication.JwtTokenAuthenticationInfo;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.persistence.PersistenceService;
import com.sap.cds.services.request.UserInfo;
import com.sap.cds.services.ServiceException;

import cds.gen.employeesservice.Employees;
import cds.gen.employeesservice.Employees_;
import cds.gen.employeesservice.EmployeesService_;
import cds.gen.employeesservice.Roles_;
import cds.gen.employeesservice.GetUserContext;
import cds.gen.employeesservice.MySelf;
import cds.gen.employeesservice.CalculateSalaryContext;

@Component
@ServiceName(EmployeesService_.CDS_NAME)
public class EmployeesServiceHandler implements EventHandler {

    @Autowired
    UserInfo userInfo;

    @Autowired
    PersistenceService persistenceService;

    private static final Logger logger = LoggerFactory.getLogger(EmployeesServiceHandler.class);

    @On(event = "calculateSalary")
    public void onCalculateSalary(CalculateSalaryContext entry) {
        String ID = entry.getId();
        var result = persistenceService.run(
                Select
                .from(Employees_.CDS_NAME)
                .where(r -> r.get("ID").eq(ID))
            ).single();
        if (result == null) {
            logger.error("Employee with id {} does not exist", ID);
            throw new ServiceException("Emlpoyee not found...");
        }
        Object oHireDate = result.get(Employees.HIRE_DATE);
        Object oRoleId = result.get(Employees.ROLE_ID);
 
        if (oHireDate == null || oRoleId == null) {
            logger.error("Missing Required parameter...");
            throw new ServiceException("Missing Required parameter...");
        }
        
        LocalDate hireDate = LocalDate.parse(oHireDate.toString());
        String roleId = oRoleId.toString();

        //Fetch base salary from master table in database
        BigDecimal baseSalary = getBaseSalary(roleId);

        if(baseSalary != null) { 
            // Calculate years of services
            int currentYear = LocalDate.now().getYear();
            int hireYear = hireDate.getYear();
            int yearOfServices = Math.max(0, currentYear - hireYear);

            // Calculate Bonus: year of services * Bonus per year
            BigDecimal bonus = BigDecimal.valueOf(yearOfServices * 1000);

            // Calculate salary with added bonus
            BigDecimal salary = baseSalary.add(bonus);

            // Return calculated salary
            entry.setResult(salary);
        }
    }

    private BigDecimal getBaseSalary(String roleId) {
        try {
            // Query
            var result = persistenceService.run(
                Select
                .from(Roles_.CDS_NAME)
                .columns("baseSalary")
                .where(r -> r.get("ID").eq(roleId))
            );

            if(result.first().isPresent()) {
                var row = result.first().get();
                Object baseSalaryObj = row.get("baseSalary");
                if (baseSalaryObj != null) {
                    return new BigDecimal(baseSalaryObj.toString());
                }
            }

        } catch (Exception e) {
            logger.error("Error fetching base salary for role ID: {}", roleId, e);
        }
        return null;
    }

    @On(event = {GetUserContext.CDS_NAME})
    public void getUserInfo(GetUserContext context){
        JwtTokenAuthenticationInfo authInfo = context.getAuthenticationInfo().as(JwtTokenAuthenticationInfo.class);
		XsuaaUserInfo userInfo = context.getUserInfo().as(XsuaaUserInfo.class);
		List<String> roles = new ArrayList<String>(userInfo.getRoles());
        logger.info("context: {}", context);
        logger.info("authInfo: {}", authInfo.getToken());
        logger.info("userInfo: {}", userInfo.getRoles());
		// set result
		MySelf me = MySelf.create();
		me.setUserId(userInfo.getEmail());
		me.setRoles(roles);
		me.setJwt(authInfo.getToken());

		context.setResult(me);
    }
}