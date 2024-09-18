import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Contact } from '../../models/contact.class';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss',
})
export class ContactsComponent implements OnInit {
  contacts$!: Observable<Contact[]>;
  contactDetail: any | null = null;
  constructor(private databaseService: DatabaseService) {}

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
}
