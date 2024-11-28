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
  constructor(private fb: FormBuilder) {
    this.addContactForm = this.fb.group({
      name: ["", Validators.required],
      email: ["", Validators.required],
      phone: ["", Validators.required],
    });
    this.editContactForm = this.fb.group({
      editedName: ["", Validators.required],
      editedEmail: ["", Validators.required],
      editedPhone: ["", Validators.required],
    });
  }

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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getKeys(obj: { [key: string]: Contact[] }): string[] {
    return Object.keys(obj);
  }

  handleShowContactDetails(id: string) {
    const contactView = document.querySelector(
      ".contacts-right"
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
  }

  extractInitials(name: string) {
    const nameParts = name.split(" ");
    const initials = nameParts.map((part) => part[0]).join("");
    return initials;
  }

  assignRandomColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  }

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
          console.error("Error creating contact:", error);
        },
        complete: () => {
          this.appComponent.showDialog("Contact created successfully.");
        },
      });
    }
  }

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

  handleDeleteContact(contactId: string): void {
    this.databaseService.deleteContact(contactId).subscribe({
      next: () => {
        // todo: show success message / refresh contact list / ask for confirmation
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

  handleAddContact() {
    this.showAddContactOverlay = true;
  }
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
  handleCloseEditContactOverlay() {
    this.showEditContactOverlay = false;
    this.editContactForm.reset();
  }
  stopEventPropagation(event: Event) {
    event.stopPropagation();
  }

  handleCloseMobileContactDetail() {
    this.contactDetail = null;
    this.showMobileContactDetail = false;
    this.showMenu = false;
  }

  handleShowMenu() {
    this.showMenu = true;
  }
}
