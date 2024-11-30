import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Employee } from '../../Models/employee';
import { EmployeeService } from '../../Services/employee.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css',
})
export class EmployeeComponent implements OnInit {
  @ViewChild('myModal') model: ElementRef | undefined;
  employeeList: Employee[] = [];
  empService = inject(EmployeeService);
  employeeForm: FormGroup = new FormGroup({});

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.setFormState();
    this.getEmployees();
  }

  openModal() {
    const empModal = document.getElementById('myModal');
    if (empModal != null) {
      empModal.style.display = 'block';
    }
  }

  closeModal() {
    this.setFormState();
    if (this.model != null) {
      this.model.nativeElement.style.display = 'none';
    }
  }

  getEmployees() {
    this.empService.getAllEmployees().subscribe((res) => {
      this.employeeList = res;
    });
  }

  setFormState() {
    this.employeeForm = this.fb.group({
      id: [0],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern('^\\d{10}$')]],
      age: ['', [Validators.required, Validators.min(18), Validators.max(60)]],
      salary: ['', [Validators.required]],
      department: ['', [Validators.required]],
      status: [false, [Validators.required]],
    });
  }

  formValues: any;

  onSubmit() {
    if (this.employeeForm.invalid) {
      this.showValidationErrors();
      return;
    }

    console.log(this.employeeForm.value);
    if (this.employeeForm.value.id == 0) {
      this.formValues = this.employeeForm.value;
      this.empService.addEmployee(this.formValues).subscribe(() => {
        alert('Employee Added Successfully');
        this.getEmployees();
        this.employeeForm.reset();
        this.closeModal();
      });
    } else {
      this.formValues = this.employeeForm.value;
      this.empService.updateEmployee(this.formValues).subscribe(() => {
        alert('Employee Updated Successfully');
        this.getEmployees();
        this.employeeForm.reset();
        this.closeModal();
      });
    }
  }

  showValidationErrors() {
    const errors = [];
    const controls = this.employeeForm.controls;

    if (controls['name'].hasError('required')) {
      errors.push('Name is required.');
    }
    if (controls['email'].hasError('required')) {
      errors.push('Email is required.');
    }
    if (controls['email'].hasError('email')) {
      errors.push('Invalid email format.');
    }
    if (controls['mobile'].hasError('required')) {
      errors.push('Mobile number is required.');
    }
    if (controls['mobile'].hasError('pattern')) {
      errors.push('Mobile number must be 10 digits.');
    }
    if (controls['age'].hasError('required')) {
      errors.push('Age is required.');
    }
    if (controls['age'].hasError('min')) {
      errors.push('Age must be at least 18.');
    }
    if (controls['age'].hasError('max')) {
      errors.push('Age cannot be more than 60.');
    }
    if (controls['salary'].hasError('required')) {
      errors.push('Salary is required.');
    }
    if (controls['department'].hasError('required')) {
      errors.push('Department is required.');
    }

    alert(errors.join('\n'));
  }

  OnEdit(Employee: Employee) {
    this.openModal();
    this.employeeForm.patchValue(Employee);
  }

  onDelete(employee: Employee) {
    const isConfirm = confirm(
      'Are you sure you want to delete this Employee ' + employee.name
    );
    if (isConfirm) {
      this.empService.deleteEmployee(employee.id).subscribe(() => {
        alert('Employee Deleted Successfully');
        this.getEmployees();
      });
    }
  }
}
