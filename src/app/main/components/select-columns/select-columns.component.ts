import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { StoryAttributesService } from '../../services/story-attributes.service';
import { StoryAttribute } from '../../models/story-attribute';

@Component({
  selector: 'app-select-columns',
  templateUrl: './select-columns.component.html',
  styleUrls: ['./select-columns.component.css'],
  providers: []
})
export class SelectColumnsComponent implements OnInit {
  @Input() storyAttributes: StoryAttribute[];

  private originalValues: any = {};

  constructor(
    private activeModal: NgbActiveModal,
    private storyAttributesService: StoryAttributesService
  ) { }

  ngOnInit(): void {
    this.storyAttributes.forEach((storyAttribute: StoryAttribute) => {
      this.originalValues[storyAttribute.id] = storyAttribute.show;
    });
  }

  ok(): void {
    let firstObservable: any = null;
    let observables: Observable<StoryAttribute>[] = [];
    this.storyAttributes.forEach((storyAttribute: StoryAttribute) => {
      if (this.originalValues[storyAttribute.id] !== storyAttribute.show) {
        if (firstObservable == null) {
          firstObservable = this.storyAttributesService.update(storyAttribute);
        } else {
          observables.push(this.storyAttributesService.update(storyAttribute));
        }
      }
    });
    if (observables.length > 0) {
      firstObservable = firstObservable.combineLatest(observables);
    }
    firstObservable.subscribe((result: any) => this.activeModal.close('OK'));
  }

  cancel(): void {
    this.storyAttributes.forEach((storyAttribute: StoryAttribute) => {
      storyAttribute.show = this.originalValues[storyAttribute.id];
    });
    this.activeModal.close('Cancel');
  }
}
