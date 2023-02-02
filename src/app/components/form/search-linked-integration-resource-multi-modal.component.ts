import { AfterViewInit, Component, ElementRef, Injectable, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, combineLatest, concat } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { ModalService, FilterOptions, allStatuses, Status } from '@mju-psi/yti-common-ui';
import { DataService } from '../../services/data.service';
import { debounceTime, skip, take, tap } from 'rxjs/operators';
import { IntegrationResource } from '../../entities/integration-resource';
import { TranslateService } from '@ngx-translate/core';
import { IntegrationResourceType } from '../../services/api-schema';
import { ConfigurationService } from '../../services/configuration.service';
import { IntegrationResourceVirtualScrollerComponent } from './integration-resource-virtual-scroller-component';

@Component({
  selector: 'app-search-linked-source-multi-modal',
  templateUrl: './search-linked-integration-resource-multi-modal.component.html',
  styleUrls: ['./search-linked-integration-resource-multi-modal.component.scss']
})
export class SearchLinkedIntegrationResourceMultiModalComponent implements AfterViewInit, OnInit {

  @ViewChild('searchInput') searchInput: ElementRef;

  // for accessing pickAll() of the child component
  @ViewChild(IntegrationResourceVirtualScrollerComponent)
  private virtualScrollerComponent: IntegrationResourceVirtualScrollerComponent;

  @Input() restricts: string[];
  @Input() useUILanguage: boolean;
  @Input() containerUri: string;
  @Input() containerType: string;
  @Input() openThreads: boolean | null;

  searchLabel: string;
  instructionText: string;
  titleLabel: string;
  selectedResources: IntegrationResource[] = [];
  statusOptions: FilterOptions<Status>;
  loading = false;
  virtualScrollerInstanceToggle = true; // This solution is needed to reset the virtual scroller because there is no API to do a reset.

  status$ = new BehaviorSubject<Status | null>(null);
  search$ = new BehaviorSubject('');
  searchResults$ = new BehaviorSubject<IntegrationResource[]>([]);
  selectedResources$ = new BehaviorSubject<IntegrationResource[]>(this.selectedResources);

  constructor(public configurationService: ConfigurationService,
              public modal: NgbActiveModal,
              public languageService: LanguageService,
              private dataService: DataService,
              private translateService: TranslateService) {
  }

  ngOnInit() {

    this.searchLabel = this.translateService.instant('Search term');

    this.statusOptions = [null, ...allStatuses].map(status => ({
      value: status,
      name: () => this.translateService.instant(status ? status : 'All statuses'),
      idIdentifier: () => status ? status : 'all_selected'
    }));

    this.titleLabel = this.translateService.instant('Select resource');
    this.instructionText = this.translateService.instant('HELP_TEXT_COMMENTTHREAD_RESOURCE_MODAL_INSTRUCTION');
    this.loading = true;

    this.filterResources();
  }

  filterResources() {

    this.loading = true;

    this.searchResults$.next([]);

    const initialSearch = this.search$.pipe(take(1));
    const debouncedSearch = this.search$.pipe(skip(1), debounceTime(500));

    combineLatest(this.status$, concat(initialSearch, debouncedSearch))
      .pipe(
        tap(() => {
          this.loading = false;
          this.virtualScrollerInstanceToggle = !this.virtualScrollerInstanceToggle;
        })).subscribe();
  }

  isResourceSelected(resource: IntegrationResource) {
    let isSelected = false;
    for (const selectedResource of this.selectedResources) { // selectedResources = the items user clicked while the modal is open just now.
      if (resource.uri === selectedResource.uri) {
        isSelected = true;
        break;
      }
    }
    for (const selectedResourceUri of this.restricts) { // restricts are the items chosen earlier before modal was opened THIS time
      if (resource.uri === selectedResourceUri) {
        isSelected = true;
        break;
      }
    }
    return isSelected;
  }

  selectResource(resource: IntegrationResource) {
    if (!this.isResourceSelected(resource)) {
      resource.type = this.containerType;
      this.selectedResources.push(resource);
    }
  }

  removeResource(resource: IntegrationResource) {
    const index: number = this.selectedResources.indexOf(resource);
    if (index !== -1) {
      this.selectedResources.splice(index, 1);
    }
    this.selectedResources$.next(this.selectedResources);
  }

  select() {
    this.modal.close(this.selectedResources);
  }

  // pick all search results as selections
  pickAll() {
    this.virtualScrollerComponent.pickAll();
  }

  ngAfterViewInit() {

    this.searchInput.nativeElement.focus();
  }

  get search() {

    return this.search$.getValue();
  }

  set search(value: string) {

    this.search$.next(value);
  }

  cancel() {

    this.modal.dismiss('cancel');
  }

  createEmptyResource() {

    const integrationResourceType: IntegrationResourceType = <IntegrationResourceType>{
      type: this.containerType
    };
    const resource: IntegrationResource = new IntegrationResource(integrationResourceType);
    this.selectedResources.push(resource);
    this.modal.close(this.selectedResources);
  }
}

@Injectable()
export class SearchLinkedIntegrationResourceMultiModalService {

  constructor(private modalService: ModalService) {
  }

  open(containerType: string,
       containerUri: string,
       openThreads: boolean | null,
       restrictedResourceUris: string[],
       useUILanguage: boolean = false): Promise<IntegrationResource[]> {

    const modalRef = this.modalService.open(SearchLinkedIntegrationResourceMultiModalComponent, { size: 'lg' });
    const instance = modalRef.componentInstance as SearchLinkedIntegrationResourceMultiModalComponent;
    instance.containerType = containerType;
    instance.containerUri = containerUri;
    instance.openThreads = openThreads;
    instance.restricts = restrictedResourceUris;
    instance.useUILanguage = useUILanguage;
    return modalRef.result;
  }
}
