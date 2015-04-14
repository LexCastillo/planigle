Planigle::Application.configure do
  # Settings specified here will take precedence over those in config/application.rb

  # The test environment is used exclusively to run your application's
  # test suite. You never need to work with it otherwise. Remember that
  # your test database is "scratch space" for the test suite and is wiped
  # and recreated between test runs. Don't rely on the data there!
  config.cache_classes = true

  # Configure static asset server for tests with Cache-Control for performance
  config.serve_static_files = true
  config.static_cache_control = "public, max-age=3600"

  # Log error messages when you accidentally call methods on nil
  config.whiny_nils = true

  # Show full error reports and disable caching
  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = false

  # Raise exceptions instead of rendering exception templates
  config.action_dispatch.show_exceptions = false

  # Disable request forgery protection in test environment
  config.action_controller.allow_forgery_protection    = false

  # Tell Action Mailer not to deliver emails to the real world.
  # The :test delivery method accumulates sent emails in the
  # ActionMailer::Base.deliveries array.
  config.action_mailer.delivery_method = :test

  # Raise exception on mass assignment protection for Active Record models
#  config.active_record.mass_assignment_sanitizer = :strict

  # Print deprecation notices to the stderr
  config.active_support.deprecation = :stderr

  config.eager_load=false

  # Tell ActionMailer not to deliver emails to the real world.
  # The :test delivery method accumulates sent emails in the
  # ActionMailer::Base.deliveries array.
  config.action_mailer.delivery_method = :test

  config.active_support.test_order = :sorted

  # Set logging to debug
  RAILS_DEFAULT_LOGGER.level = Logger::DEBUG if defined? RAILS_DEFAULT_LOGGER

  # Set notification
  PLANIGLE_EMAIL_NOTIFIER = Notification::TestNotifier.new
  PLANIGLE_SMS_NOTIFIER = Notification::TestNotifier.new
  
  # Whether LDAP should be used for authentication; if true you must set the next few values
  config.use_ldap = false

  # Host name of the LDAP server (ignored if LDAP not in use)
  config.ldap_host = "<FQDN of LDAP Server>"
  
  # Port of the LDAP server (ignored if LDAP not in use)
  config.ldap_port = 389
  
  # Domain suffic to look up on the LDAP server (ignored if LDAP not in use)
  config.domain_suffix = "@<company name>.com"
  
  # Criteria for searching the LDAP server (ignored if LDAP not in use)
  config.ldap_search_base = "ou=people,dc=<company name>,dc=com"

  # The number of days without logging in to be considered inactive and notified (blank=no notification)
  config.notify_of_inactivity_after = nil

  # The maximum number of days to be notified of inactivity (blank=no maximum; useful when first enabling notification)
  config.notify_of_inactivity_before = nil

  # The number of days before expiration to notify (blank=no notification)
  config.notify_when_expiring_in = nil

  # The protocol://host[:port] of the server (for URLs). Ex. http://www.planigle.com
  config.site_url = ''
  
  # The image tag for your logo '<img height="nnn" width="nnn" src="url"/>'
  config.site_logo = nil

  # Support's email address
  config.support_email = nil

  # The URL for your backlog
  config.backlog_url = nil

  # The email address to notify of things going on with projects (creation, expiration, inactivity; blank=no one)
  config.who_to_notify = nil
end