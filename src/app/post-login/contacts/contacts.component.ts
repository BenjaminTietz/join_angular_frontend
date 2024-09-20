import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Contact } from '../../models/contact.class';
import { DatabaseService } from '../../services/database.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss',
})
export class ContactsComponent implements OnInit {
  contacts$!: Observable<Contact[]>;
  contactDetail: any | null = null;
  addContactForm!: FormGroup;
  editContactForm!: FormGroup;
  showAddContactOverlay = false;
  showEditContactOverlay = false;
  constructor(
    private databaseService: DatabaseService,
    private fb: FormBuilder
  ) {
    this.addContactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      phone: ['', Validators.required],
    });
    this.editContactForm = this.fb.group({
      editedName: ['', Validators.required],
      editedEmail: ['', Validators.required],
      editedPhone: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.contacts$ = this.databaseService.getContacts();
  }

  handleShowContactDetails(id: string) {
    this.databaseService.getContactById(id).subscribe((contact) => {
      console.log(contact);
      this.contactDetail = contact;
    });
    console.log(this.contactDetail);
  }
  handleEditContact() {
    this.showEditContactOverlay = true;
    this.editContactForm.setValue({
      editedName: this.contactDetail.name,
      editedEmail: this.contactDetail.email,
      editedPhone: this.contactDetail.phone,
    });
  }

  extractInitials(name: string) {
    const nameParts = name.split(' ');
    const initials = nameParts.map((part) => part[0]).join('');
    return initials;
  }

  assignRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  onSubmit() {
    if (this.addContactForm.valid) {
      const newContact: Contact = {
        id: '',
        name: this.addContactForm.value.name,
        email: this.addContactForm.value.email,
        phone: this.addContactForm.value.phone,
        initials: this.extractInitials(this.addContactForm.value.name),
        color: this.assignRandomColor(),
        createdAt: '',
        createdBy: '',
      };
      console.log('Creating contact:', newContact);
      this.databaseService.createContact(newContact).subscribe({
        next: (contact) => {
          console.log('Contact created:', contact);
          // todo show success message / reset form / refresh contact list
          this.handleCloseAddContactOverlay();
        },
        error: (error) => {
          console.error('Error creating contact:', error);
        },
        complete: () => {
          console.log('Contact creation process completed.');
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
              console.log('Contact updated:', updatedContact);
              // Todo: refresh contact list / show success message
            },
            error: (error) => {
              console.error('Error updating contact:', error);
            },
            complete: () => {
              console.log('Contact update process completed.');
            },
          });
      } else {
        console.log('No changes detected, contact not updated.');
      }
    }
  }
  onDeleteEditContactForm() {
    // todo : delete contact
  }

  handleAddContact() {
    this.showAddContactOverlay = true;
  }
  handleCloseAddContactOverlay() {
    this.showAddContactOverlay = false;
    this.addContactForm.reset();
  }
  handleCloseEditContactOverlay() {
    this.showEditContactOverlay = false;
    this.editContactForm.reset();
  }
}
