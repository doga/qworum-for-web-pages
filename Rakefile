# Rakefile

# Dependencies: jsdoc (`npm install -g jsdoc`)

task default: :help

desc 'Show available Rake tasks'
task :help do
    sh "rake -T"
end

desc 'Build the documentation'
task docs: [:clear_docs] do
  sh "npm run generate-docs"
  # sh "jsdoc #{tmpfile} -d docs --readme README.md" # default template (Google doesn't like it)
end

desc 'Empty the docs directory'
task :clear_docs do
  begin
    sh "trash docs/*"
  rescue
  end
end
