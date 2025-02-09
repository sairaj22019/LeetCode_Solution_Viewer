const URL = "https://api.github.com/repos/haoel/leetcode/git/trees/master?recursive=1";

// token generation for more requests
const token="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"  

let searchInfo=document.getElementById("search-text");
let button=document.getElementById("search-button");
let languageSelect=document.getElementById("select-language");
const languageToggleBtn = document.getElementById("language-toggle-btn");


document.querySelector(".solution-container-features").style.display="none";

async function find_path(problem_name){
  const response=await fetch(URL, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    const data = await response.json();

    if (!data||!data.tree){
        console.error("Invalid response structure:", data);
        document.querySelector(".solution").innerHTML= "<p>No valid data returned from API.</p>";
        return;
    }
    
    // removing all spaces,underscores and hypens from entered input 
    const formattedProblemName=problem_name.toLowerCase().replace(/[\s-_]+/g, "");

    
    const matchingFiles=data.tree.filter(file =>{
        const fileName=file.path.toLowerCase();
        return fileName.includes(formattedProblemName);
    });
    if(matchingFiles.length === 0){
        console.warn("No matching files found.");
        document.querySelector(".solution").innerHTML= "";
        document.querySelector(".error-alert").innerHTML= `<p>No solutions found for "${searchInfo.value}".</p>`;
        let scrollToTop=document.querySelector(".header-content");
        scrollToTop.scrollIntoView({behavior:"smooth",block:"nearest"});
        document.querySelector(".solution-container-features").style.display= "none";

    }else {
        document.querySelector(".solution-container-features").style.display="flex";
        console.log("Matching files:", matchingFiles);
        document.querySelector(".solution").innerHTML= "";
        document.querySelector(".error-alert").innerHTML="";
        matchingFiles.forEach(file => fetchSolutionCode(file.path));
    }
}

// function to fetch filepath
async function fetchSolutionCode(filePath) {
    const filePathUrl= `https://raw.githubusercontent.com/haoel/leetcode/master/${filePath}`;
    const response= await fetch(filePathUrl);  
    const code=await response.text();
    displayCode(filePath,code);
}

// function to display code from filepath 
function displayCode(filePath, code){
    const solutionContainer=document.querySelector(".solution");
    const solutionCard=document.createElement("div");
    const solutionContainerFeaturesTitle=document.querySelector(".solution-container-features-title");
    let solutionSection=document.querySelector(".solution-container");

    solutionCard.classList.add("solution-card");
    if (currMode === "dark") {
        solutionCard.classList.add("dark-theme");
    } else {
        solutionCard.classList.add("light-theme");
    }

    let selectedLanguage=languageSelect.value;
    let languageMap={
        ".cpp":"cpp",
        ".py":"python",
        ".java":"java"
    };
    let languageMapToggleBtn={
        ".cpp":"C++",
        ".py":"Python",
        ".java":"Java"
    };
    let langClass=languageMap[selectedLanguage]||"plaintext";
    if(selectedLanguage===".cpp"||selectedLanguage===".py"){
        let fileName=filePath.split("/")[2];  // for cpp and python 
        solutionContainerFeaturesTitle.innerHTML=`<h3>Problem: ${fileName}</h3>`;

    }else{
        let fileName=filePath.split("/")[3];  // for Java
        solutionContainerFeaturesTitle.innerHTML=`<h3>Problem: ${fileName}</h3>`;

    }
    solutionCard.innerHTML = `
    <pre><code class="language-${langClass}">${hljs.highlight(code, { language: langClass }).value}</code></pre>
`;
    solutionContainer.appendChild(solutionCard);
    languageToggleBtn.textContent=languageMapToggleBtn[selectedLanguage];
    hljs.highlightAll(); // calling highlight.js for syntax highlighting
    solutionSection.scrollIntoView({behavior:"smooth",block:"nearest"});
    solutionSection.style.height="100vh";
}

    
// this function fetches the data from json file using question id and returns title of corresponding problem. 
let title=async function getQuestionData(questionId){
    const url='https://gist.githubusercontent.com/dabasajay/1c42402db1b5a1b47ea009e67ad3effe/raw/problemslist.json';
        const response=await fetch(url); 
            const data=await response.json();
            const problem=data.stat_status_pairs.find(problem=>problem.stat.question_id==questionId);
            if(problem){
                let ConvertedTitle=problem.stat.question__title;
                return ConvertedTitle;
            }
}
    
// search functionality 
function search(){
    let inputValue=searchInfo.value.trim();
    let selectedLanguage = languageSelect.value;

        if(inputValue===""){
            document.querySelector(".error-alert").innerHTML="<p>Please enter a problem name or number</p>";
        }else{
            if(!selectedLanguage||selectedLanguage==="place-holder") {
                document.querySelector(".error-alert").innerHTML="<p>Please select a language before searching</p>";   
            }else if(inputValue){
                if(/^\d+$/.test(inputValue)){
                    let inputAsInteger = parseInt(inputValue, 10);
                    title(inputAsInteger).then(ans => {
                        ans+=selectedLanguage;
                        find_path(ans);
                    });
                }else{
                    inputValue+=selectedLanguage;
                    find_path(inputValue);
                    }

                    if(inputValue && selectedLanguage !== "place-holder"){
                        storeSearchHistory(inputValue, selectedLanguage);
                    }
            }
        }
 
    }
button.addEventListener("click", search);
searchInfo.addEventListener("keypress",(e)=>{
    if(e.key==="Enter"){
        search();
    }
});
languageSelect.addEventListener("keypress",(e) =>{
    e.preventDefault();
    if (e.key==="Enter"){
        search();
    }
});

//language toggle
const dropdownItems=document.querySelectorAll(".dropdown-content p");
dropdownItems.forEach(item =>{
    item.addEventListener("click",function (){
        let selectedLanguage=this.getAttribute("data-lang");
        let currentProblem=searchInfo.value.trim(); // Get the current problem name

        if (currentProblem){
            let problemTitleWithLang=currentProblem+selectedLanguage;
            find_path(problemTitleWithLang); // Fetch solution in selected language
            languageToggleBtn.textContent=this.textContent; // Update button text
        }
    });
});
    



// switch theme between dark mode and light functionality
let modeBtn=document.querySelector("#mode");
let currMode="light";
let changeThemeButton=document.querySelector(".change-theme-button")
let copyCodeButton=document.querySelector(".copy-button-logo")
let preTags = document.querySelectorAll("pre")
let codeTags = document.querySelectorAll("code")
document.querySelector(".solution-container-features").classList.add("light-theme");
let searchHistory=document.querySelector(".search-history")
modeBtn.addEventListener("click",()=>{
    if(currMode==="light"){
        currMode="dark";
        document.querySelector(".solution-container-features").classList.remove("light-theme");
        document.querySelector(".solution").classList.remove("light-theme");
        document.querySelector(".solution-container").classList.remove("light-theme");
        document.querySelector(".solution-card").classList.remove("light-theme");
        document.querySelector(".solution-container-features").classList.add("dark-theme");
        document.querySelector(".solution").classList.add("dark-theme");
        document.querySelector(".solution-card").classList.add("dark-theme");
        document.querySelector(".solution-container").classList.add("dark-theme");
        searchHistory.classList.remove("light-theme");
        searchHistory.classList.add("dark-theme");
        changeThemeButton.style.color="white";
        copyCodeButton.style.color="white";
        
    }else{
        currMode="light";
        document.querySelector(".solution-container-features").classList.remove("dark-theme");
        document.querySelector(".solution").classList.remove("dark-theme");
        document.querySelector(".solution-container").classList.remove("dark-theme");
        document.querySelector(".solution-card").classList.remove("dark-theme");
        document.querySelector(".solution-container-features").classList.add("light-theme");
        document.querySelector(".solution").classList.add("light-theme");
        document.querySelector(".solution-card").classList.add("light-theme");
        document.querySelector(".solution-container").classList.add("light-theme");
        searchHistory.classList.remove("dark-theme");
        searchHistory.classList.add("light-theme");
        changeThemeButton.style.color="black";
        copyCodeButton.style.color="black";
    }
})


// copy code functionality
document.querySelector("#copy-button").addEventListener("click",function(){
    const codeContent=document.querySelector(".solution-card code");
    if (codeContent){
        navigator.clipboard.writeText(codeContent.innerText).then(function(){
            alert('Code copied');
        })
    }
});

//search-history functionality
let searchHistoryContainer=document.querySelector(".search-history");

// Function to store search history in localStorage
function storeSearchHistory(problem, language){
    let searches=JSON.parse(localStorage.getItem("searchHistory"))||[];
    let Name=problem.split(".");
    let searchEntry=`${Name[0]} (${language})`;
    if(!searches.includes(searchEntry)){
        searches.unshift(searchEntry);
        if(searches.length>10) searches.pop();
        localStorage.setItem("searchHistory",JSON.stringify(searches));
    }
    displaySearchHistory();
}
// Function to display search history
function displaySearchHistory(){
    let searches = JSON.parse(localStorage.getItem("searchHistory"))||[];
    searchHistoryContainer.innerHTML="<h4>Recent Searches:</h4>";
    
    searches.forEach(search=>{
        let searchItem=document.createElement("p");
        searchItem.textContent=search;
        searchItem.classList.add("search-item");
        searchItem.style.cursor="pointer";
        searchItem.addEventListener("click",() =>{
            let [problem,language]=search.split(" (");
            searchInfo.value=problem;
            languageSelect.value=language.replace(")", "");
            button.click();
        });
        searchHistoryContainer.appendChild(searchItem);
    });

    // Button to clear history
    if(searches.length>0){
        let clearBtn=document.createElement("button");
        clearBtn.textContent="Clear History";
        clearBtn.classList.add("clear-history");
        clearBtn.addEventListener("click",()=>{
            localStorage.removeItem("searchHistory");
            displaySearchHistory();
        });
        searchHistoryContainer.appendChild(clearBtn);
    }
}



