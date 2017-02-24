class AddPriority < ActiveRecord::Migration[4.2]
  def self.up
    add_column :stories, :priority, :integer
    Story.with_deleted.each {|story| story.priority = story.id; story.save( :validate=> false )}
  end

  def self.down
    remove_column :stories, :priority
  end
end
