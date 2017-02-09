import { NgZone, Component, AfterViewInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { EditReasonBlockedComponent } from '../edit-reason-blocked/edit-reason-blocked.component';
import { SessionsService } from '../../services/sessions.service';
import { TeamsService } from '../../services/teams.service';
import { StoriesService } from '../../services/stories.service';
import { TasksService } from '../../services/tasks.service';
import { Team } from '../../models/team';
import { Story } from '../../models/story';
import { Task } from '../../models/task';
import { Individual } from '../../models/individual';
declare var $: any;

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
  providers: [ TeamsService, StoriesService, TasksService ]
})
export class TasksComponent implements AfterViewInit {
  teams: Team[] = [];
  team: any;
  stories: Story[] = [];
  mapping: Map<number, Task> = new Map<number, Task>();
  private refresh_interval = null;

  constructor(
    private zone: NgZone,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private sessionsService: SessionsService,
    private teamsService: TeamsService,
    private storiesService: StoriesService,
    private tasksService: TasksService
  ) { }

  ngAfterViewInit(): void {
    this.fetchTeams();
    this.route.params.subscribe((params: Map<string, string>) => this.applyNavigation(params));
    if (this.getUser().refresh_interval) {
      let self: TasksComponent = this;
      this.refresh_interval = setInterval(() => {
        self.refresh();
      }, this.getUser().refresh_interval);
    }
  }

  updateNavigation(): void {
    let params: Map<string, string> = new Map();
    if (this.team !== 'MyTeam') {
      params['team'] = this.team;
    }
    this.router.navigate(['tasks', params]);
  }

  refresh(): void {
    this.fetchStories();
  }

  private getUser(): Individual {
    return this.sessionsService.getCurrentUser();
  }

  private applyNavigation(params: Map<string, string>): void {
    this.team = params['team'] == null ? 'MyTeam' : params['team'];
    this.fetchStories();
  }

  private fetchTeams(): void {
    this.teamsService.getTeams(this.getUser().selected_project_id)
      .subscribe(
        (teams: Team[]) => {
          this.addTeamOptions(teams);
        });
  }

  private addTeamOptions(teams: Team[]): void {
    teams.push(new Team({
      id: '',
      name: 'No Team'
    }));
    teams.push(new Team({
      id: 'All',
      name: 'All Teams'
    }));
    teams.push(new Team({
      id: 'MyTeam',
      name: 'My Team'
    }));
    this.teams = teams;
    if (this.team != null) {
      let index = this.getIndex(this.teams, this.team);
      this.team = index !== -1 ? this.teams[index].id : null;
    }
    if (this.team == null) {
      this.team = this.teams[this.teams.length - 1].id;
    }
  }

  getIndex(objects: any[], id: number): number {
    let index: number = -1;
    let i = 0;
    objects.forEach((object: any) => {
      if (('' + object.id) === ('' + id)) {
        index = i;
      }
      i++;
    });
    return index;
  }

  private fetchStories(): void {
    let queryString = '?iteration_id=Current&status_code=NotDone';
    if (this.team !== 'All') {
      queryString += '&team_id=' + (this.team ? this.team : '');
    }
    this.storiesService.getStories(queryString).subscribe((stories: Story[]) => {
      this.stories = stories;
      this.setDragDrop();
    });
  }

  private setDragDrop(): void {
    let self: TasksComponent = this;
    setTimeout((timeout) => {
      $('.task').draggable({
        revert: 'invalid',
        helper: function() {
          return $('<div style="width: ' + $(this).parent().width() + 'px"></div>').append($(this).clone());
        }
      });
      self.stories.forEach((story: Story) => {
        story.tasks.forEach((task: Task) => {
          self.mapping.set(task.id, task);
        });
        $('.task[story="' + story.id + '"]').draggable('option', 'containment', '.row[story="' + story.id + '"]');
      });
      $('.droppable').droppable({
        tolerance: 'pointer',
        drop: function(event, ui) {
          self.dropTask(event, ui, $(this));
        }
      });
    }, 0);
  }

  private dropTask(event, ui, dropTarget): void {
    let task: Task = this.mapping.get(parseInt($(ui.draggable[0]).attr('task'), 10));
    let newStatus = parseInt(dropTarget.attr('status'), 10);
    if (newStatus === 2) {
      this.zone.run(() => {
        const modalRef: NgbModalRef = this.modalService.open(EditReasonBlockedComponent);
        let model: any = {
          reason_blocked: ''
        };
        modalRef.componentInstance.model = model;
        modalRef.result.then(
          (result: any) => {
            if (model.reason_blocked != null) {
              this.finishUpdateStatus(task, newStatus, model.reason_blocked);
            }
          });
      });
    } else {
      this.finishUpdateStatus(task, newStatus, '');
    }
  }

  private finishUpdateStatus(task, newStatus, reason_blocked): void {
    let model: Task = new Task(task);
    model.status_code = newStatus;
    model.reason_blocked = reason_blocked;
    this.tasksService.update(model).subscribe((revisedTask: Task) => {
      this.zone.run(() => {
        task.status_code = revisedTask.status_code;
        task.reason_blocked = revisedTask.reason_blocked;
        task.individual_id = revisedTask.individual_id;
        task.individual_name = revisedTask.individual_name;
        this.setDragDrop();
      });
    });
  }
}
