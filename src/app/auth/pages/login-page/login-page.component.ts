import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2'

@Component({
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {

  // Formularios Reactivos
  private fb = inject( FormBuilder );
  private authService = inject( AuthService );


  public myForm: FormGroup = this.fb.group({
    email: ['carlosv97m@gmail.com', [ Validators.required, Validators.email ]],
    password: ['123456', [ Validators.required, Validators.minLength( 6 ) ]],
  });

  login() {
    const { email, password } = this.myForm.value;
    this.authService.login(email, password).subscribe({
      next:() => console.log('Todo Bien!'),
      error: (message) => {
        Swal.fire("Error", message,"error");
      }

    })

  }
}
