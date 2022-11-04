import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { CommentRoundStatus } from '../../entities/comment-round-status';
import { Location } from '@angular/common';
import { formatDate, validDateRange } from '../../utils/date';
import { requiredList } from '@vrk-yti/yti-common-ui';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { EditableService } from '../../services/editable.service';
import { LanguageService } from '../../services/language.service';
import { LocationService } from '../../services/location.service';
import { Organization } from '../../entities/organization';
import { CommentRoundType, SourceType } from '../../services/api-schema';
import { tap } from 'rxjs/operators';
import { IntegrationResourceService } from '../../services/integrationresource.service';
import { IntegrationResource } from '../../entities/integration-resource';
import { ConfigurationService } from '../../services/configuration.service';

@Component({
  selector: 'app-commentround-create',
  templateUrl: './comment-round-create.component.html',
  styleUrls: ['./comment-round-create.component.scss'],
  providers: [EditableService]
})
export class CommentRoundCreateComponent implements OnInit {

  integrationResource: IntegrationResource;

  commentRoundForm = new FormGroup({
    label: new FormControl(''),
    description: new FormControl(''),
    fixedThreads: new FormControl(true),
    openThreads: new FormControl(false),
    validity: new FormControl({ start: null, end: null }, validDateRange),
    status: new FormControl('INCOMPLETE' as CommentRoundStatus),
    organizations: new FormControl([], [requiredList]),
    resource: new FormControl(null)
  }, null);

  constructor(private router: Router,
              private route: ActivatedRoute,
              private dataService: DataService,
              private integrationResourceService: IntegrationResourceService,
              private editableService: EditableService,
              private activatedRoute: ActivatedRoute,
              private location: Location,
              private languageService: LanguageService,
              private locationService: LocationService,
              private configurationService: ConfigurationService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
    editableService.cancel$.subscribe(() => this.back());
    this.editableService.edit();
  }

  ngOnInit() {

    const integrationResourceUri = this.route.snapshot.params.integrationResourceUri;

    if (integrationResourceUri) {
      this.integrationResource = this.integrationResourceService.getIntegrationResource(integrationResourceUri);

      if (this.integrationResource) {
        this.commentRoundForm.patchValue({ resource: this.integrationResource });
      }
    }

    this.locationService.atCommentRoundCreatePage();
  }

  get toolType(): string {

    const integrationResource: IntegrationResource = this.commentRoundForm.controls['resource'].value;
    if (integrationResource && integrationResource.type) {
      return integrationResource.type;
    }
    return '-';
  }

  back() {

    this.location.back();
  }

  save(formData: any): Observable<any> {

    const { label, description, fixedThreads, openThreads, validity, organizations, resource, status } = formData;

    const source: SourceType = <SourceType> {
      'containerType': resource.type,
      'containerUri': resource.uri
    };

    const commentRound: CommentRoundType = <CommentRoundType> {
      label: label,
      description: description,
      fixedThreads: fixedThreads,
      openThreads: openThreads,
      startDate: formatDate(validity.start),
      endDate: formatDate(validity.end),
      organizations: organizations.map((organization: Organization) => organization.serialize()),
      source: source,
      sourceLocalName: resource.localName,
      sourceLabel: resource.prefLabel,
      status: status
    };

    const save = () => {
      return this.dataService.createCommentRound(commentRound)
        .pipe(tap(createdCommentRound => {
          this.router.navigate(createdCommentRound.route);
        }));
    };

    return save();
  }

  get getResourceUri(): string | null {

    if (this.commentRoundForm.controls['resource'].value) {
      const uri = this.commentRoundForm.controls['resource'].value.uri;
      return this.configurationService.getUriWithEnv(uri);
    }
    return null;
  }
}
