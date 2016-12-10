class TasksController < ResourceController
  before_action :login_required

  # Notify of key changes.
  def update
    Task.transaction do
      @record = get_record
      story = @record.story
      was_ready_to_accept_before = story.is_ready_to_accept
      super
      if !was_ready_to_accept_before && story.reload.is_ready_to_accept
        story.send_notification(current_individual, "All tasks for a story are done", story.ready_to_accept_message)
      end
    end
  rescue ActiveRecord::RecordNotFound
    head 404
  end

protected

  # Answer descriptor for this type of object
  def record_type
    "Task"
  end

  # Get the records based on the current individual.
  def get_records
    Task.where(story_id: params[:story_id]).order(status_code: :desc, name: :asc)
  end

  # Answer whether the resulting record is visible
  def record_visible
    @record.matches(session[:conditions])
  end

  # Answer the current record based on the current individual.
  def get_record
    task = Task.find_by(id: params[:id], story_id: params[:story_id])
    if !task; raise ActiveRecord::RecordNotFound.new; end
    task
  end
  
  # Create a new record given the params.
  def create_record
    task = Task.new(params[:record])
    task.story_id = params[:story_id]
    task
  end
  
  # Update the record given the params.
  def update_record
    old_status = @record.status_code
    @record.attributes = record_params
    if (params[:record])
      effort = params[:record][:effort]
      status = params[:record][:status_code]
      owner = params[:record][:individual_id]
    end
    if @record.status_code == Story.Done && effort == nil
      @record.effort = 0
    end
    if old_status == Story.Created && status != nil && status != Story.Created && @record.individual_id == nil && owner == nil
      @record.individual_id = current_individual.id
    end
  end
  
private
  def record_params
    params.require(:record).permit(:name, :description, :effort, :status_code, :individual_id, :story_id, :reason_blocked, :priority, :actual, :estimate)
  end
end