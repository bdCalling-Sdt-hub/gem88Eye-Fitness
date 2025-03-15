export enum USStates {
    ALABAMA = "alabama",
    ALASKA = "alaska",
    ARIZONA = "arizona",
    ARKANSAS = "arkansas",
    CALIFORNIA = "california",
    COLORADO = "colorado",
    CONNECTICUT = "connecticut",
    DELAWARE = "delaware",
    FLORIDA = "florida",
    GEORGIA = "georgia",
    HAWAII = "hawaii",
    IDAHO = "idaho",
    ILLINOIS = "illinois",
    INDIANA = "indiana",
    IOWA = "iowa",
    KANSAS = "kansas",
    KENTUCKY = "kentucky",
    LOUISIANA = "louisiana",
    MAINE = "maine",
    MARYLAND = "maryland",
    MASSACHUSETTS = "massachusetts",
    MICHIGAN = "michigan",
    MINNESOTA = "minnesota",
    MISSISSIPPI = "mississippi",
    MISSOURI = "missouri",
    MONTANA = "montana",
    NEBRASKA = "nebraska",
    NEVADA = "nevada",
    NEW_HAMPSHIRE = "new-hampshire",
    NEW_JERSEY = "new-jersey",
    NEW_MEXICO = "new-mexico",
    NEW_YORK = "new-york",
    NORTH_CAROLINA = "north-carolina",
    NORTH_DAKOTA = "north-dakota",
    OHIO = "ohio",
    OKLAHOMA = "oklahoma",
    OREGON = "oregon",
    PENNSYLVANIA = "pennsylvania",
    RHODE_ISLAND = "rhode-island",
    SOUTH_CAROLINA = "south-carolina",
    SOUTH_DAKOTA = "south-dakota",
    TENNESSEE = "tennessee",
    TEXAS = "texas",
    UTAH = "utah",
    VERMONT = "vermont",
    VIRGINIA = "virginia",
    WASHINGTON = "washington",
    WEST_VIRGINIA = "west-virginia",
    WISCONSIN = "wisconsin",
    WYOMING = "wyoming"
  }
  
  export const USStatesWithCities: Record<USStates, { label: string; children: { value: string; label: string }[] }> = {
    [USStates.ALABAMA]: { 
      label: "Alabama", 
      children: [
        { value: "birmingham", label: "Birmingham" },
        { value: "montgomery", label: "Montgomery" },
        { value: "mobile", label: "Mobile" },
        { value: "huntsville", label: "Huntsville" }
      ] 
    },
    [USStates.ALASKA]: { 
      label: "Alaska", 
      children: [
        { value: "anchorage", label: "Anchorage" },
        { value: "juneau", label: "Juneau" },
        { value: "fairbanks", label: "Fairbanks" }
      ] 
    },
    [USStates.ARIZONA]: { 
      label: "Arizona", 
      children: [
        { value: "phoenix", label: "Phoenix" },
        { value: "tucson", label: "Tucson" },
        { value: "mesa", label: "Mesa" },
        { value: "scottsdale", label: "Scottsdale" }
      ] 
    },
    [USStates.ARKANSAS]: { 
      label: "Arkansas", 
      children: [] 
    },
    [USStates.CALIFORNIA]: { 
      label: "California", 
      children: [
        { value: "los-angeles", label: "Los Angeles" },
        { value: "san-francisco", label: "San Francisco" },
        { value: "san-diego", label: "San Diego" },
        { value: "sacramento", label: "Sacramento" }
      ] 
    },
    [USStates.COLORADO]: { 
      label: "Colorado", 
      children: [] 
    },
    [USStates.CONNECTICUT]: { 
      label: "Connecticut", 
      children: [] 
    },
    [USStates.DELAWARE]: { 
      label: "Delaware", 
      children: [] 
    },
    [USStates.FLORIDA]: { 
      label: "Florida", 
      children: [
        { value: "miami", label: "Miami" },
        { value: "orlando", label: "Orlando" },
        { value: "tampa", label: "Tampa" },
        { value: "jacksonville", label: "Jacksonville" }
      ] 
    },
    [USStates.GEORGIA]: { 
      label: "Georgia", 
      children: [] 
    },
    [USStates.HAWAII]: { 
      label: "Hawaii", 
      children: [] 
    },
    [USStates.IDAHO]: { 
      label: "Idaho", 
      children: [] 
    },
    [USStates.ILLINOIS]: { 
      label: "Illinois", 
      children: [] 
    },
    [USStates.INDIANA]: { 
      label: "Indiana", 
      children: [] 
    },
    [USStates.IOWA]: { 
      label: "Iowa", 
      children: [
        { value: "des-moines", label: "Des Moines" },   
        { value: "council-bluffs", label: "Council Bluffs" },
        { value: "sioux-city", label: "Sioux City" }
      ] 
    },
    [USStates.KANSAS]: { 
      label: "Kansas", 
      children: [] 
    },
    [USStates.KENTUCKY]: { 
      label: "Kentucky", 
      children: [] 
    },
    [USStates.LOUISIANA]: { 
      label: "Louisiana", 
      children: [] 
    },
    [USStates.MAINE]: { 
      label: "Maine", 
      children: [] 
    },
    [USStates.MARYLAND]: { 
      label: "Maryland", 
      children: [] 
    },
    [USStates.MASSACHUSETTS]: { 
      label: "Massachusetts", 
      children: [] 
    },
    [USStates.MICHIGAN]: { 
      label: "Michigan", 
      children: [
        { value: "detroit", label: "Detroit" },
        { value: "ann-arbor", label: "Ann Arbor" },
        { value: "flint", label: "Flint" }
      ] 
    },
    [USStates.MINNESOTA]: { 
      label: "Minnesota", 
      children: [
        { value: "minneapolis", label: "Minneapolis" },
        { value: "st-paul", label: "St Paul" },
        { value: "duluth", label: "Duluth" }
      ] 
    },
    [USStates.MISSISSIPPI]: { 
      label: "Mississippi", 
      children: [] 
    },
    [USStates.MISSOURI]: { 
      label: "Missouri", 
      children: [] 
    },
    [USStates.MONTANA]: { 
      label: "Montana", 
      children: [] 
    },
    [USStates.NEBRASKA]: { 
      label: "Nebraska", 
      children: [] 
    },
    [USStates.NEVADA]: { 
      label: "Nevada", 
      children: [] 
    },
    [USStates.NEW_HAMPSHIRE]: { 
      label: "New Hampshire", 
      children: [] 
    },
    [USStates.NEW_JERSEY]: { 
      label: "New Jersey", 
      children: [
        { value: "newark", label: "Newark" },
        { value: "jersey-city", label: "Jersey City" }
      ] 
    },
    [USStates.NEW_MEXICO]: { 
      label: "New Mexico", 
      children: [
        { value: "albuquerque", label: "Albuquerque" },
        { value: "las-cruces", label: "Las Cruces" },
        { value: "santa-fe", label: "Santa Fe" }
      ] 
    },
    [USStates.NEW_YORK]: { 
      label: "New York", 
      children: [
        { value: "new-york-city", label: "New York City" },
        { value: "buffalo", label: "Buffalo" }
      ] 
    },
    [USStates.NORTH_CAROLINA]: { 
      label: "North Carolina", 
      children: [
        { value: "charlotte", label: "Charlotte" },
        { value: "raleigh", label: "Raleigh" },
        { value: "greensboro", label: "Greensboro" }
      ] 
    },
    [USStates.NORTH_DAKOTA]: { 
      label: "North Dakota", 
      children: [] 
    },
    [USStates.OHIO]: { 
      label: "Ohio", 
      children: [] 
    },
    [USStates.OKLAHOMA]: { 
      label: "Oklahoma", 
      children: [] 
    },
    [USStates.OREGON]: { 
      label: "Oregon", 
      children: [
        { value: "portland", label: "Portland" },
        { value: "eugene", label: "Eugene" },
        { value: "salem", label: "Salem" }
      ] 
    },
    [USStates.PENNSYLVANIA]: { 
      label: "Pennsylvania", 
      children: [
        { value: "philadelphia", label: "Philadelphia" },   
        { value: "pittsburgh", label: "Pittsburgh" },
        { value: "allentown", label: "Allentown" }
      ] 
    },
    [USStates.RHODE_ISLAND]: { 
      label: "Rhode Island", 
      children: [] 
    },
    [USStates.SOUTH_CAROLINA]: { 
      label: "South Carolina", 
      children: [
        { value: "columbia", label: "Columbia" },
        { value: "charleston", label: "Charleston" },
        { value: "myrtle-beach", label: "Myrtle Beach" }
      ] 
    },
    [USStates.SOUTH_DAKOTA]: { 
      label: "South Dakota", 
      children: [] 
    },
    [USStates.TENNESSEE]: { 
      label: "Tennessee", 
      children: [
        { value: "memphis", label: "Memphis" },
        { value: "nashville", label: "Nashville" },
        { value: "knoxville", label: "Knoxville" }
      ] 
    },
    [USStates.TEXAS]: { 
      label: "Texas", 
      children: [
        { value: "houston", label: "Houston" },
        { value: "dallas", label: "Dallas" },
        { value: "austin", label: "Austin" }
      ] 
    },
    [USStates.UTAH]: { 
      label: "Utah", 
      children: [] 
    },
    [USStates.VERMONT]: { 
      label: "Vermont", 
      children: [] 
    },
    [USStates.VIRGINIA]: { 
      label: "Virginia", 
      children: [] 
    },
    [USStates.WASHINGTON]: { 
      label: "Washington", 
      children: [
        { value: "seattle", label: "Seattle" },
        { value: "spokane", label: "Spokane" },
        { value: "tacoma", label: "Tacoma" }
      ] 
    },
    [USStates.WEST_VIRGINIA]: { 
      label: "West Virginia", 
      children: [] 
    },
    [USStates.WISCONSIN]: { 
      label: "Wisconsin", 
      children: [] 
    },
    [USStates.WYOMING]: { 
      label: "Wyoming", 
      children: [] 
    }
  };