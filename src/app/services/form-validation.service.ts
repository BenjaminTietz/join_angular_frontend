import { Injectable } from "@angular/core";
import { AbstractControl, ValidationErrors, FormGroup } from "@angular/forms";

@Injectable({
  providedIn: "root",
})
export class FormValidationService {
  /**
   * Custom validator to check the strength of a password.
   */
  strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;
    const errors: ValidationErrors = {};
    if (password.length < 8) errors["minLength"] = true;
    if (/^\d+$/.test(password)) errors["numericOnly"] = true;
    const commonPasswords = [
      "12345678",
      "password",
      "123456789",
      "qwerty",
      "123456",
      "abc123",
      "password1",
    ];
    if (commonPasswords.includes(password.toLowerCase()))
      errors["tooCommon"] = true;
    if (!/[a-zA-Z]/.test(password) || !/\d/.test(password))
      errors["weak"] = true;
    return Object.keys(errors).length > 0 ? errors : null;
  }

  /**
   * Validator to ensure passwords match.
   */
  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get("password")?.value;
    const confirmPassword = control.get("confirmPassword")?.value;
    return password && confirmPassword && password !== confirmPassword
      ? { passwordsMismatch: true }
      : null;
  }

  /**
   * Returns error messages for password validation.
   */
  getPasswordErrors(control: AbstractControl): string | null {
    if (!control.touched || !control.errors) return null;
    const errors = control.errors;
    if (errors["required"]) return "The password is required.";
    if (errors["minLength"])
      return "The password must be at least 8 characters long.";
    if (errors["numericOnly"])
      return "The password must not be entirely numeric.";
    if (errors["tooCommon"])
      return "The password is too common. Please choose a stronger one.";
    if (errors["weak"])
      return "The password must contain at least one letter and one number.";
    return null;
  }

  /**
   * Returns an error message if passwords do not match.
   */
  getConfirmPasswordError(form: FormGroup): string | null {
    return form.hasError("passwordsMismatch") &&
      form.get("confirmPassword")?.touched
      ? "Passwords do not match."
      : null;
  }
}
