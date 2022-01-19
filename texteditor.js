const JAVA_KEY = "62";
const C_KEY = "50";
const CPP_KEY = "54";
const PYTHON_KEY = "70";
const PYTHON3_KEY = "71";
const BASE_URL = "https://executecode.csestack.org/submissions";

const UNKNOWN_ERR_MSG = "Error occurred. Kindly check your language selection and code. Try again.";

function codeEditor(lang_id) {
  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/chrome");
  editor.session.setMode("ace/mode/c_cpp");

  if(lang_id==CPP_KEY || lang_id==C_KEY) {
    editor.session.setMode("ace/mode/c_cpp");
  } else if(lang_id==JAVA_KEY) {
    editor.session.setMode("ace/mode/java");
  } else if(lang_id==PYTHON_KEY || lang_id==PYTHON3_KEY) {
    editor.session.setMode("ace/mode/python");
  } else {
    editor.session.setMode("ace/mode/plain_text");
  }

  //console.log("id" + lang_id )
  $(document).ready(function () {
    $(".btn-execute").click(function () {
      let code = encode(editor.getValue());
      var input = document.getElementById("editor-input").value;

      set_output("Executing....", "...", "...");
      
      $(window).scrollTop($(window).height());

      //console.log(code);
      let data = {
        source_code: code,
        language_id: lang_id,
        number_of_runs: "1",
        stdin: input,
        expected_output: null,
        cpu_time_limit: "2",
        cpu_extra_time: "0.5",
        wall_time_limit: "5",
        memory_limit: "128000",
        stack_limit: "64000",
        max_processes_and_or_threads: "60",
        enable_per_process_and_thread_time_limit: false,
        enable_per_process_and_thread_memory_limit: false,
        max_file_size: "1024",
        base64_encoded: true,
      };

      //console.log(data);
      let request = $.ajax({
        url: BASE_URL+"?base64_encoded=true",
        type: "post",
        data: data,
        error: function() { 
            set_output("Error occurred. Try again.", "-", "-"); 
        }
      });

      const delay = (ms) => new Promise((res) => setTimeout(res, ms));
      // Callback handler that will be called on success
      request.done(async function (response, textStatus, jqXHR) {

        console.log("11*********response");
        console.log(JSON.stringify(response));
        console.log("11*********textStatus");
        console.log(textStatus);

        if(textStatus=="success") {
          let token = response.token;
          await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 sec
          let second_request = $.ajax({
            url: BASE_URL + "/"+ token,
            type: "get",
            error: function() { 
                set_output(UNKNOWN_ERR_MSG, "-", "-"); 
            }
          });
          second_request.done(function (response) {
            //console.log("Response:" + JSON.stringify(response));

            console.log("22*********response");
            console.log(JSON.stringify(response));
            console.log("22*********textStatus");
            console.log(textStatus);

            if(textStatus=="success") {
              if(response.stdout) {
               console.log("111");
               set_output(response.stdout, response.time, response.memory);
              } else {
                  console.log("222");
                set_output(response.stderr, response.time, response.memory);
              }
            } else {
               set_output(UNKNOWN_ERR_MSG, "-", "-"); 
            }
          });
        } else {
          set_output(UNKNOWN_ERR_MSG, "-", "-");
        }
      });
    });
  });


  if (localStorage.getItem("cscode")) {
    editor.setValue(localStorage.getItem("cscode"));
    // document.getElementById('editor').innerText = localStorage.getItem("cscode");
  }
  else {
    // Python
    if(lang_id==PYTHON_KEY || lang_id==PYTHON3_KEY) {
      // editor.setValue("def execute(): \n\t for i in range(10):\n\t\t print i \nexecute()");
      editor.setValue('print("Hello, World!")');
    }

    // Java
    if(lang_id==JAVA_KEY) {
      let javacode = `public class Main {\n\tpublic static void main(String args[]) {\n\t\tSystem.out.println("Hello, World!");\n\t}\n}`;
      editor.setValue(javacode)
    }


    // C
    if(lang_id==C_KEY) {
      let ccode = `#include <stdio.h>\n\nint main() {\n\tprintf("Hello, World!");\n\treturn 0;\n}`
      editor.setValue(ccode)
    }

    // C++
    if(lang_id==CPP_KEY) {
        let cppcode = `#include <iostream>\nusing namespace std;\n\nint main() {\n\tcout<<"Hello, World!";\n}`
        editor.setValue(cppcode)
    }
  }
} 


function encode(str) {
    return btoa(unescape(encodeURIComponent(str || "")));
}

function decode(bytes) {
    var escaped = escape(atob(bytes || ""));
    try {
        return decodeURIComponent(escaped);
    } catch {
        return unescape(escaped);
    }
}

function set_output(out="", time="-", mem="-"){
      $("#ans").html(out);
      $("#ans-time").html(time);
      $("#ans-memory").html(mem);
}