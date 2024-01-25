#!/bin/bash
# set strict mode, so any errors exit the script
set -e

# all the required env variables that the export needs
# We list them out, and check below to ensure they were passed into the docker container
REQUIRED_ENV_VARIABLES=(
    "USERNAME"
    "PASSWORD"
    "BASE_URL"
)


# --- --- --- --- --- 
# Helper Functions
# --- --- --- --- --- 

# helper function to ensure any env variables required to run the app are available
function validateEnvVariables() {
    echo "Validating ENV Variables"
    
    # loop through our list of required env variables
    for temp_var in "${REQUIRED_ENV_VARIABLES[@]}"; do

        # check if the variable is available in the shell somewhere
        # Note the exclamation mark before the variable. This uses indirect parameter expansion.
        # https://stackoverflow.com/questions/1921279/how-to-get-a-variable-value-if-variable-name-is-stored-as-string
        if [[ -z "${!temp_var}" ]]; then
            echo "Environment variable '$temp_var' is missing or doesn't have a value. Exiting"
            env | grep "$temp_var"
            exit 1
        fi
    done
}



# --- --- --- --- --- 
# Main Script Logic
# --- --- --- --- --- 

echo "`date` -- Starting the export"

# ensure all necessary env variables are present
validateEnvVariables

# run the export
yarn start

echo "`date` -- Finished the export"
