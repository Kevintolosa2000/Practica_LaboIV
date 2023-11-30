
listAll();
function api_Call(url, HTTPMethod, body) {
    return new Promise((resolve, reject) => {
        var request = new XMLHttpRequest();
        request.open(HTTPMethod, url);
        request.responseType = 'json';
        request.onload = () => {
            if (request.status == 200 || request.status == 201) {
                resolve(request.response);
            } else {
                reject(`IT WAS A PROBLEM WITH THE API: ${request.status}`);
            }
        }
        if (HTTPMethod == 'POST') {
            request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            request.send(body);
        } else {
            request.send();
        }
    })
}


function listAll() {

    const employeeData = api_Call('https://utn-lubnan-api-2.herokuapp.com/api/Employee', 'GET', null);
    const companyData = api_Call('https://utn-lubnan-api-2.herokuapp.com/api/Company', 'GET', null);

    Promise.all([employeeData, companyData])
        .then(([employee, company]) => {

            /*employee.sort((a, b) => a.lastName.localeCompare(b.lastName));//ordenar por apellido*/

            employee.sort((a, b) => b.id - a.id);//ordenar por id

            /*const filterEmployees = employee.filter(employee => {
                return employee.companyId !== null && company.find(c => c.name === 'Kwimbee' && c.companyId === employee.companyId);
            });*/

            /*const filterEmployees = employee.filter(employee => {
                return employee.companyId !== null && employee.employeeId % 2 === 0;
            });*/

            /*const filterEmployees = employee.filter(employee => {
                return employee.companyId !== null && employee.firstName.startsWith('J');
            });*/

            /*const filterEmployees = employee.filter(employee => {
                return employee.companyId !== null && employee.email.includes('yelp');
            });*/

            const filterEmployees = employee.filter(employee => {
                return employee.companyId !== null && employee.employeeId >= 600 && employee.employeeId <= 700 && company.find(c => c.companyId === employee.companyId && c.companyId % 2 !== 0);
            })

            /* const filteredEmails = filterEmployees.map(employee => employee.email);*/



            filterEmployees.forEach((ultimateEmployee) => {
                createTableEmployee(ultimateEmployee, company);
            })

            /*company.forEach((companies) => {
                createTableCompany(employee, companies);
            });*/


        })
        .catch(error => {
            console.error('Error:', error);
        });

}



function createTableEmployee(employee, company) {

    const rowHTML = `
    <tr id='${employee.employeeId}'>
      <td>${employee.employeeId}</td>   
      <td>${employee.lastName}</td>
      <td>${employee.firstName}</td>
      <td>${employee.email}</td>
      <td>${company.find(c => c.companyId === employee.companyId).companyId}</td>
      <td>${company.find(c => c.companyId === employee.companyId).name}</td>
      <td>
        <button onclick="deleteEmployee(${employee.employeeId})" class="btn btn-danger">Delete Employee</button>
      </td>
    </tr>
    `;

    const employee_table = document.getElementById('employee_table');
    employee_table.insertAdjacentHTML('beforeend', rowHTML);


    console.log(employee);
}

function createTableCompany(employee, company) {

    let i = 0;

    employee.forEach((employeeData) => {

        if (employeeData.companyId == company.companyId) {
            i++;
        }

    })

    const rowHTML = `
    <tr id='${company.companyId}'>
      <td>${company.companyId}</td>   
      <td>${company.name}</td>   
      <td>${i}</td>
      <td>
        <button onclick="deleteCompanyWithAllEmployee(${company.companyId})" class="btn btn-danger">Delete Company</button>
      </td>
    </tr>
    `;

    const employee_table = document.getElementById('company_table');
    employee_table.insertAdjacentHTML('beforeend', rowHTML);

    console.log(company);
}


function deleteEmployee(employeeId) {

    api_Call(`https://utn-lubnan-api-2.herokuapp.com/api/Employee/${employeeId}`, 'DELETE', null)
        .then((response) => {
            deleteFromTable(employeeId)
        })
        .catch((reason) => {
            console.error('Error:', reason);
        });
}

function deleteCompanyWithAllEmployee(companyId) {

    api_Call(`https://utn-lubnan-api-2.herokuapp.com/api/Company/${companyId}`, 'DELETE', null)
        .then(() => {
            api_Call('https://utn-lubnan-api-2.herokuapp.com/api/Employee', 'GET', null)
                .then((employees) => {

                    const filterEmployees = employees.filter(employee => companyId === employee.companyId);

                    if (Array.isArray(filterEmployees)) {
                        filterEmployees.forEach((ultimateEmployee) => {
                            deleteEmployee(ultimateEmployee.employeeId);
                            deleteFromTable(ultimateEmployee.employeeId);
                        });
                    } else {
                        console.error('Error: filterEmployees is not an array');
                    }
                })
                .catch((companyDeleteError) => {
                    console.error('Error deleting company:', companyDeleteError);
                });
        })
        .catch((employeeFetchError) => {
            console.error('Error fetching employees:', employeeFetchError);
        });
}


function deleteFromTable(id) {
    let row = document.getElementById(id);
    row.remove();
}


function submitForm() {
    const employee = {
        employeeId: 1001,
        companyId: document.getElementById('companyId').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value
    };

    console.log('Employee Data:', employee);

    api_Call('https://utn-lubnan-api-2.herokuapp.com/api/Employee', 'POST', employee)
        .then((response) => {
            if (response && response.status) {
                console.log('Status:', response.status);
                alert('Employee added successfully!');
            } else {
                console.error('Error: Response is null or missing status property');
                alert('Error adding employee. Please check the console for details.');
            }
        })
        .catch((reason) => {
            console.error('Error:', reason);
            alert('Error adding employee. Please check the console for details.');
        });
}

/*function addEmployeeAndCompany(employee, company) {
    api_Call('https://utn-lubnan-api-2.herokuapp.com/api/Company', 'POST',  JSON.stringify(company))
        .then((companyResponse) => {
            console.log('Company added successfully:', companyResponse);
            
            api_Call('https://utn-lubnan-api-2.herokuapp.com/api/Employee', 'POST',  JSON.stringify(employee))
                .then((employeeResponse) => {
                    console.log('Employee added successfully:', employeeResponse);
                    
                    listAll();

                })
                .catch((employeeError) => {
                    console.error('Error adding employee:', employeeError);
                });
        })
        .catch((companyError) => {
            console.error('Error adding company:', companyError);
        });
}

function addFromTable(employee, company) {
    createTable(employee, company);
}

const employee1 = {
    employeeId: 1001,
    companyId: 21,
    firstName: 'kevin',
    lastName: 'tolosa',
    email: 'drembrandtjj@utexas.edu'
};

const company1 = {
    companyId: 21,
    name: 'Netherrealm'
};

const employee2 = {
    employeeId: 1002,
    companyId: 21,
    firstName: 'franco',
    lastName: 'giudi',
    email: 'asmith@example.com'
};

addEmployeeAndCompany(employee1, company1);
addEmployeeAndCompany(employee2, company1);*/