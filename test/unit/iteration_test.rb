require File.dirname(__FILE__) + '/../test_helper'

class IterationTest < ActiveSupport::TestCase
  fixtures :teams
  fixtures :individuals
  fixtures :iteration_totals
  fixtures :iteration_velocities
  fixtures :iterations
  fixtures :projects
  fixtures :stories
  fixtures :tasks

  # Test that an iteration can be created.
  def test_create_iteration
    assert_difference 'Iteration.count' do
      iteration = create_iteration
      assert !iteration.new_record?, "#{iteration.errors.full_messages.to_sentence}"
    end
  end

  # Test the validation of name.
  def test_name
    validate_field(:name, true, 1, 40)
  end

  # Test the validation of start.
  def test_start
    assert_success(:start, Date.today)
    assert_failure(:start, nil)
    assert_failure(:start, '2')
  end

  # Test the validation of finish.
  def test_finish
    assert_success(:finish, Date.today + 1)
    assert_failure(:finish, nil)
    assert_failure(:finish, '2')
    assert_failure(:finish, Date.today)
    assert_failure(:finish, Date.today - 1)
  end

  # Test the validation of retrospective results.
  def test_retrospective_results
    validate_field(:retrospective_results, true, nil, 4096)
  end
  
  # Test deleting an iteration
  def test_delete_iteration
    total_count = IterationTotal.count
    velocity_count = IterationVelocity.count
    assert_equal stories(:first).iteration, iterations(:first)
    iterations(:first).destroy
    stories(:first).reload
    assert_nil stories(:first).iteration
    assert_equal total_count - 2, IterationTotal.count
    assert_equal velocity_count - 1, IterationVelocity.count
  end
  
  # Test updating the project
  def test_update_project
    assert_equal stories(:first).iteration, iterations(:first)
    iterations(:first).project_id = 2
    stories(:first).reload
    assert_equal 2, stories(:first).project_id
  end

  # Test finding iterations for a specific user.
  def test_find
    assert_equal 0, Iteration.get_records(individuals(:quentin)).length
    assert_equal Iteration.find_all_by_project_id(1).length, Iteration.get_records(individuals(:aaron)).length
    assert_equal Iteration.find_all_by_project_id(1).length, Iteration.get_records(individuals(:user)).length
    assert_equal Iteration.find_all_by_project_id(1).length, Iteration.get_records(individuals(:readonly)).length
  end
  
  # Test finding the current iteration
  def test_find_current
    assert_nil Iteration.find_current(individuals(:admin2))
    iteration = create_iteration()
    assert_equal iteration, Iteration.find_current(individuals(:admin2))
  end
  
  # Test summarization.
  def test_summarize
    totals = IterationTotal.summarize_for(iterations(:first))
    totals.each do |total|
      if total.team == nil
        assert_equal 0, total.in_progress
        assert_equal 0, total.done
      end
      if total.team == teams(:first)
        assert_equal 3, total.in_progress
        assert_equal 2, total.done
      end
    end

    totals = IterationVelocity.summarize_for(iterations(:first))
    totals.each do |total|
      if total.team == nil
        assert_equal 1, total.attempted
        assert_equal 1, total.completed
      end
      if total.team == teams(:first)
        assert_equal 1, total.attempted
        assert_equal 0, total.completed
      end
    end
    
    iterations(:first).summarize
  end

private

  # Create an iteration with valid values.  Options will override default values (should be :attribute => value).
  def create_iteration(options = {})
    Iteration.create({ :name => 'foo', :start => Date.today, :finish => Date.today + 14, :project_id => 1 }.merge(options))
  end
end
