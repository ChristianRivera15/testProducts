import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-product-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './pop-up-new-register-products.component.html',
  styleUrls: ['./pop-up-new-register-products.component.scss']
})
export class PopUpNewRegisterProductsComponent implements OnInit {
  productForm!: FormGroup;
  maxDate = new Date();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PopUpNewRegisterProductsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      title: string; 
      payload: any; 
      isNew: boolean 
    }
  ) {}

  ngOnInit(): void {
    console.log(this.data)
    this.initializeForm(this.data.payload);
  }

  initializeForm(data: any): void {
    const revisionDate = new Date();
    const releaseDate = new Date(revisionDate);
    releaseDate.setFullYear(releaseDate.getFullYear() - 1);
    
    this.productForm = this.fb.group({
      id: [{value: data.id, disabled: !this.data.isNew},[Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      name: [data.name ||'', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: [data.description ||'', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      logo: [data.logo || '', Validators.required],
      date_release: [data.date_release ? new Date(data.date_release) : releaseDate, Validators.required],
      date_revision: [{value: data.date_revision ? new Date(data.date_revision) : revisionDate, disabled: true}, Validators.required]
    });

    this.productForm.get('date_release')?.valueChanges.subscribe(val => {
      if (val) {
        const releaseDate = new Date(val);
        const revisionDate = new Date(releaseDate);
        revisionDate.setFullYear(revisionDate.getFullYear() - 1);
        this.productForm.get('date_revision')?.setValue(revisionDate.toISOString().split('T')[0]);
      }
    });
  }

  onSubmit(): void {
    const form = this.productForm.getRawValue();
    let prd: any = {
      id: form.id,
      name: form.name,
      description: form.description,
      logo: form.logo,
      date_release: form.date_release,
      date_revision: form.date_revision
    }
    this.dialogRef.close(prd);
    
  }


  onCancel(): void {
    this.dialogRef.close(false);
  }
}