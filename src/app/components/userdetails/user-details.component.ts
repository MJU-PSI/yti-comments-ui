import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from 'yti-common-ui/services/user.service';
import { Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { DataService } from '../../services/data.service';
import { NgbTabChangeEvent, NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';
import { MessagingResource } from '../../entity/messaging-resource';

@Component({
  selector: 'app-user-details',
  styleUrls: ['./user-details.component.scss'],
  templateUrl: './user-details.component.html',
})
export class UserDetailsComponent implements OnInit {

  @ViewChild('tabSet') tabSet: NgbTabset;

  APPLICATION_CODELIST = 'codelist';
  APPLICATION_TERMINOLOGY = 'terminology';
  APPLICATION_DATAMODEL = 'datamodel';
  APPLICATION_COMMENTS = 'comments';

  loading = true;

  messagingResources$ = new BehaviorSubject<Map<string, MessagingResource[]> | null>(null);

  constructor(private router: Router,
              private userService: UserService,
              private locationService: LocationService,
              private dataService: DataService) {

    locationService.atUserDetails();
  }

  ngOnInit() {

    this.getUserSubscriptionData();
  }

  getUserSubscriptionData() {

    this.dataService.getMessagingUserData().subscribe(messagingUserData => {
      this.loading = true;
      const resources = new Map<string, MessagingResource[]>();
      const codelistMessagingResources: MessagingResource[] = [];
      const datamodelMessagingResources: MessagingResource[] = [];
      const terminologyMessagingResources: MessagingResource[] = [];
      const commentsMessagingResources: MessagingResource[] = [];

      messagingUserData.resources.forEach(resource => {
        if (resource.application === this.APPLICATION_CODELIST) {
          codelistMessagingResources.push(resource);
        } else if (resource.application === this.APPLICATION_DATAMODEL) {
          datamodelMessagingResources.push(resource);
        } else if (resource.application === this.APPLICATION_TERMINOLOGY) {
          terminologyMessagingResources.push(resource);
        } else if (resource.application === this.APPLICATION_COMMENTS) {
          commentsMessagingResources.push(resource);
        }
      });
      if (codelistMessagingResources.length > 0) {
        resources.set(this.APPLICATION_CODELIST, codelistMessagingResources);
      }
      if (datamodelMessagingResources.length > 0) {
        resources.set(this.APPLICATION_DATAMODEL, datamodelMessagingResources);
      }
      if (terminologyMessagingResources.length > 0) {
        resources.set(this.APPLICATION_TERMINOLOGY, terminologyMessagingResources);
      }
      if (commentsMessagingResources.length > 0) {
        resources.set(this.APPLICATION_COMMENTS, commentsMessagingResources);
      }
      if (resources.size > 0) {
        this.messagingResources = resources;
        this.loading = false;
      } else {
        this.messagingResources = null;
        this.loading = false;
      }
    });
  }

  onTabChange(event: NgbTabChangeEvent) {

    if (event.nextId === 'user_details_info_tab') {
      this.getUserSubscriptionData();
    }
  }

  get messagingResources(): Map<string, MessagingResource[]> | null {

    return this.messagingResources$.getValue();
  }

  set messagingResources(value: Map<string, MessagingResource[]> | null) {

    this.messagingResources$.next(value);
  }
}
