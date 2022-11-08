import { Component, OnDestroy } from '@angular/core';
import { Role, UserService, index, comparingLocalizable, Options, combineSets, hasAny, labelNameToResourceIdIdentifier } from '@goraresult/yti-common-ui';
import { Router } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { LocationService } from '../../services/location.service';
import { DataService } from '../../services/data.service';
import { Organization } from '../../entities/organization';
import { OrganizationSimple } from '../../entities/organization-simple';
import { TranslateService } from '@ngx-translate/core';

interface UserOrganizationRoles {
  organization?: OrganizationSimple;
  roles: Role[];
  requests: Role[];
}

@Component({
  selector: 'app-user-details-information',
  templateUrl: './user-details-information.component.html',
})
export class UserDetailsInformationComponent implements OnDestroy {

  private subscriptionToClean: Subscription[] = [];

  allOrganizations: OrganizationSimple[];
  allOrganizationsById: Map<string, OrganizationSimple>;
  selectedOrganization: OrganizationSimple | null = null;
  requestsInOrganizations = new Map<string, Set<Role>>();

  constructor(private router: Router,
              private userService: UserService,
              private locationService: LocationService,
              private dataService: DataService,
              private languageService: LanguageService,
              private translateService: TranslateService) {

    this.subscriptionToClean.push(this.userService.loggedIn$.subscribe(loggedIn => {
      if (!loggedIn) {
        router.navigate(['/']);
      }
    }));

    userService.updateLoggedInUser();

    locationService.atUserDetails();

    this.subscriptionToClean.push(
      combineLatest(this.dataService.getOrganizations(), languageService.language$)
        .subscribe(([organizations]) => {
          organizations.sort(comparingLocalizable<Organization>(languageService, org => org.prefLabel));
          this.allOrganizations = organizations;
          this.allOrganizationsById = index(organizations, org => org.id);
        })
    );

    this.refreshRequests();
  }

  ngOnDestroy() {

    this.subscriptionToClean.forEach(s => s.unsubscribe());
  }

  get user() {

    return this.userService.user;
  }

  get loading() {

    return !this.allOrganizations || !this.requestsInOrganizations;
  }

  get userOrganizations(): UserOrganizationRoles[] {

    const organizationIds = new Set<string>([
      ...Array.from(this.user.rolesInOrganizations.keys()),
      ...Array.from(this.requestsInOrganizations.keys())
    ]);

    const result = Array.from(organizationIds.values()).map(organizationId => {
      return {
        organization: this.allOrganizationsById.get(organizationId),
        roles: Array.from(this.user.getRoles(organizationId)),
        requests: Array.from(this.requestsInOrganizations.get(organizationId) || [])
      };
    });

    result.sort(comparingLocalizable<UserOrganizationRoles>(this.languageService, org =>
      org.organization ? org.organization.prefLabel : {}));

    return result;
  }

  get organizationOptions(): Options<OrganizationSimple> {

    const hasExistingRoleOrRequest = (org: OrganizationSimple) => {

      const rolesOrRequests = combineSets([
        this.user.getRoles(org.id),
        this.requestsInOrganizations.get(org.id) || new Set<Role>()
      ]);

      return hasAny(rolesOrRequests, ['MEMBER', 'ADMIN']);
    };

    const requestableOrganizations = this.allOrganizations.filter(organization => !hasExistingRoleOrRequest(organization));

    return [null, ...requestableOrganizations].map(org => {
      return {
        value: org,
        name: () => org ? this.languageService.translate(org.prefLabel, true)
          : this.translateService.instant('Select organization'),
        idIdentifier: () => org ? labelNameToResourceIdIdentifier(this.languageService.translate(org.prefLabel, true)) : 'all_selected'
      };
    });
  }

  refreshRequests() {

    this.selectedOrganization = null;

    this.dataService.getUserRequests().subscribe(userRequests => {

      this.requestsInOrganizations.clear();

      for (const userRequest of userRequests) {
        this.requestsInOrganizations.set(userRequest.organizationId, new Set<Role>(userRequest.role));
      }
    });
  }

  sendRequest() {

    if (!this.selectedOrganization) {
      throw new Error('No organization selected for request');
    }

    this.dataService.sendUserRequest(this.selectedOrganization.id)
      .subscribe(() => this.refreshRequests());
  }
}
