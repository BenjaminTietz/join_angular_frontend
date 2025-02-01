import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { Contact } from "../../models/contact.class";
import { DatabaseService } from "../../services/database.service";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { HeaderComponent } from "../header/header.component";
import { SidenavComponent } from "../sidenav/sidenav.component";
import { AppComponent } from "../../app.component";
import { CommunicationService } from "../../services/communication.service";
import { map } from "rxjs/operators";

@Component({
  selector: "app-contacts",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderComponent,
    SidenavComponent,
  ],
  templateUrl: "./contacts.component.html",
  styleUrl: "./contacts.component.scss",
})
export class ContactsComponent implements OnInit, OnDestroy {
  groupedContacts: { letter: string; contacts: Contact[] }[] = [];
  private subscriptions: Subscription = new Subscription();
  contactDetail: any | null = null;
  addContactForm!: FormGroup;
  editContactForm!: FormGroup;
  showAddContactOverlay = false;
  showEditContactOverlay = false;
  showMobileContactDetail = false;
  showMenu = false;
  private appComponent = inject(AppComponent);
  public communicationService = inject(CommunicationService);
  private databaseService = inject(DatabaseService);
  /**
   * The constructor for the ContactsComponent class.
   * @param fb The FormBuilder service is injected into the component to create
   *     the addContactForm and editContactForm.
   */
  constructor(private fb: FormBuilder) {
    this.addContactForm = this.fb.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, this.emailValidator()]],
      phone: ["", Validators.required],
    });
    this.editContactForm = this.fb.group({
      editedName: ["", Validators.required],
      editedEmail: ["", [Validators.required, this.emailValidator()]],
      editedPhone: ["", Validators.required],
    });
  }

  /**
   * Initializes the component by:
   * 1. Initializing the DatabaseService by calling its initializeData method with true as the argument.
   * 2. Subscribing to the contacts$ observable and grouping the contacts by the first letter of their name.
   * 3. Assigning the grouped contacts to the groupedContacts field.
   */
  ngOnInit(): void {
    this.databaseService.initializeData(true);
    this.databaseService
      .getContacts()
      .pipe(
        map((contacts: Contact[]) => {
          const grouped = contacts.reduce(
            (acc: { [key: string]: Contact[] }, contact: Contact) => {
              const letter = contact.name.charAt(0).toUpperCase();
              if (!acc[letter]) {
                acc[letter] = [];
              }
              acc[letter].push(contact);
              return acc;
            },
            {}
          );
          return Object.entries(grouped).map(([letter, contacts]) => ({
            letter,
            contacts,
          }));
        })
      )
      .subscribe((groupedContacts) => {
        this.groupedContacts = groupedContacts;
      });
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   * Unsubscribes from all subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Retrieves the keys of an object where each key is associated with an array of Contact objects.
   *
   * @param obj - An object with keys of type string and values of type array of Contact.
   * @returns An array of strings representing the keys of the input object.
   */
  getKeys(obj: { [key: string]: Contact[] }): string[] {
    return Object.keys(obj);
  }

  /**
   * A custom validator function that checks if the value of the input control is a valid email
   * address. The function takes an AbstractControl as an argument and returns a ValidationErrors
   * object if the email is invalid, or null if the email is valid. The email is considered
   * invalid if it does not match the following regular expression:
   * /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
   * @returns A ValidationErrors object if the email is invalid, or null if the email is valid.
   */
  emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const valid = emailRegex.test(control.value);
      return valid ? null : { invalidEmail: true };
    };
  }
  /**
   * Handles showing the details of a contact when the user clicks on it from the contacts list.
   * Slides out the current contact details, and then slides in the new contact details.
   * @param id - The id of the contact to show the details of.
   */
  handleShowContactDetails(id: string) {
    const contactView = document.querySelector(
      ".contact-detail-view"
    ) as HTMLElement;
    if (contactView) {
      contactView.classList.remove("slide-in");
      contactView.classList.add("slide-out");
    }
    this.databaseService.getContactById(id).subscribe((contact) => {
      this.contactDetail = contact;
      setTimeout(() => {
        if (contactView) {
          contactView.classList.remove("slide-out");
          contactView.classList.add("slide-in");
        }
      }, 10);
    });
    this.showMobileContactDetail = true;
  }

  /**
   * Handles showing the edit contact overlay when the user clicks the edit button for a contact.
   * Retrieves the contact details and populates the edit contact form with the contact's current values.
   * It also marks all form controls as touched and updates the form's validity.
   */
  handleEditContact() {
    this.showEditContactOverlay = true;
    const contactOverlay = document.querySelector(
      ".contact-overlay"
    ) as HTMLElement;
    if (contactOverlay) {
      contactOverlay.classList.remove("hidden");
      contactOverlay.classList.add("visible");
    }
    this.editContactForm.setValue({
      editedName: this.contactDetail.name,
      editedEmail: this.contactDetail.email,
      editedPhone: this.contactDetail.phone,
    });
    this.editContactForm.markAllAsTouched();
    this.editContactForm.updateValueAndValidity();
    this.toggleMobileMenu();
  }

  /**
   * Given a name, splits it into individual parts and extracts the first letter of each part to create an
   * initial string. This is used to generate the initial for a contact's display name.
   * @param name The name to split and extract initials from.
   * @returns The initial string.
   */
  extractInitials(name: string) {
    const nameParts = name.split(" ");
    const initials = nameParts.map((part) => part[0]).join("");
    return initials;
  }

  /**
   * Generates a random hexadecimal color code.
   *
   * @returns A string representing a random color in the format "#RRGGBB".
   */
  assignRandomColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  }

  /**
   * Handles the submission of the add contact form.
   * If the form is valid, it creates a new contact object, assigns random initials and color,
   * and sends a request to create the contact in the database.
   * Upon successful creation, closes the add contact overlay and reloads the contacts.
   * Displays a dialog on successful completion or logs an error on failure.
   */
  onSubmit() {
    if (this.addContactForm.valid) {
      const newContact: Contact = {
        id: "",
        name: this.addContactForm.value.name,
        email: this.addContactForm.value.email,
        phone: this.addContactForm.value.phone,
        initials: this.extractInitials(this.addContactForm.value.name),
        color: this.assignRandomColor(),
        createdAt: "",
      };
      this.databaseService.createContact(newContact).subscribe({
        next: (contact) => {
          this.handleCloseAddContactOverlay();
          this.databaseService.loadContacts();
        },
        error: (error) => {
          this.appComponent.showDialog("Error creating contact.");
        },
        complete: () => {
          this.appComponent.showDialog("Contact created successfully.");
        },
      });
    }
  }

  /**
   * Handles the submission of the edit contact form.
   * If the form is valid and there are changes, it sends a request to update the contact in the database.
   * Upon successful update, closes the edit contact overlay and reloads the contacts.
   * Displays a dialog on successful completion, or logs an error on failure.
   * If there are no changes, displays a dialog indicating so and closes the overlay.
   */
  onSubmitEditContactForm() {
    if (this.editContactForm.valid) {
      const oldContact = this.contactDetail;
      const newContact = {
        name: this.editContactForm.value.editedName,
        email: this.editContactForm.value.editedEmail,
        phone: this.editContactForm.value.editedPhone,
      };
      const hasChanges =
        oldContact.name !== newContact.name ||
        oldContact.email !== newContact.email ||
        oldContact.phone !== newContact.phone;
      if (hasChanges) {
        this.databaseService
          .updateContact(oldContact.id, newContact)
          .subscribe({
            next: (updatedContact) => {
              this.databaseService.loadContacts();
              this.handleCloseEditContactOverlay();
              this.contactDetail = updatedContact;
            },
            error: (error) => {
              this.appComponent.showDialog("Error updating contact.");
            },
            complete: () => {
              this.appComponent.showDialog("Contact updated successfully.");
            },
          });
      } else {
        this.appComponent.showDialog("No changes detected.");
        this.handleCloseEditContactOverlay();
      }
    }
  }

  /**
   * Deletes a contact by its ID.
   * Sends a request to delete the contact from the database and updates the UI accordingly.
   * On successful deletion, sets the contact detail to null and reloads the contact list.
   * Displays a success dialog on completion or an error dialog if the deletion fails.
   *
   * @param contactId - The ID of the contact to be deleted.
   */
  handleDeleteContact(contactId: string): void {
    this.databaseService.deleteContact(contactId).subscribe({
      next: () => {
        this.showEditContactOverlay = false;
        this.showMobileContactDetail = false;
        this.showMenu = false;
        this.contactDetail = null;
        this.databaseService.loadContacts();
      },
      error: (error) => {
        this.appComponent.showDialog("Error deleting contact.");
      },
      complete: () => {
        this.appComponent.showDialog("Contact deleted successfully.");
      },
    });
  }

  /**
   * Opens the overlay for adding a new contact.
   * Sets the `showAddContactOverlay` flag to true, making the add contact form visible.
   */
  handleAddContact() {
    this.showAddContactOverlay = true;
  }
  /**
   * Closes the add contact overlay.
   * Hides the add contact overlay, resets the add contact form and waits for 500ms before setting the `showAddContactOverlay` flag to false.
   * This allows the animation of the overlay to finish before the flag is set to false.
   */
  handleCloseAddContactOverlay() {
    const contactOverlay = document.querySelector(
      ".contact-overlay"
    ) as HTMLElement;
    if (contactOverlay) {
      contactOverlay.classList.remove("visible");
      contactOverlay.classList.add("hidden");
    }
    setTimeout(() => {
      this.showAddContactOverlay = false;
      this.addContactForm.reset();
    }, 500);
  }

  /**
   * Closes the edit contact overlay.
   * Hides the edit contact overlay and resets the edit contact form.
   */
  handleCloseEditContactOverlay() {
    this.showEditContactOverlay = false;
    this.editContactForm.reset();
  }

  /**
   * Stops the propagation of the given event.
   * @param event The event whose propagation is to be stopped.
   */
  stopEventPropagation(event: Event) {
    event.stopPropagation();
  }

  /**
   * Closes the mobile contact detail view.
   * Hides the mobile contact detail view, resets the contact detail to null and hides the menu.
   */
  handleCloseMobileContactDetail() {
    this.contactDetail = null;
    this.showMobileContactDetail = false;
    this.showMenu = false;
  }

  /**
   * Displays the menu.
   * Sets the `showMenu` flag to true, making the menu visible.
   */
  toggleMobileMenu() {
    this.showMenu = !this.showMenu;
  }
}
