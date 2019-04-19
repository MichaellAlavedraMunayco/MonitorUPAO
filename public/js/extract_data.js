// Extracción de datos Campus UPAO - Módulo Reporte de notas
// Estado academico
console.log((() => {
  var general = document.getElementById("lst_registrados_inig");
  var content = general.children[1].children[0].children;
  var output_data = {
    "PPA": parseFloat(content[0].children[1].innerText.trim()),
    "CurAT": parseInt(content[0].children[3].innerText.trim()),
    "USA": content[0].children[5].innerText.trim(),
    "PPS": parseFloat(content[1].children[1].innerText.trim()),
    "CreA": parseInt(content[1].children[3].innerText.trim()),
    "Egre": content[1].children[5].innerText.trim()
  };
  return JSON.stringify(output_data);
})());

// Extracción de datos Campus UPAO - Módulo Notas por Componente
// Datos de cursos
console.log((() => {
  var output_data = {};
  var general = document.getElementById("id_contenido_componentes");
  var content = general.children[1].children[0];
  var title = general.children[0].children[0].children[0].children[0].innerText;
  var split = title.split('-');
  output_data = {
    "id_curso": split[0].trim() + "-" + split[1].trim(),
    "nombre": split[2].trim()
  };
  var content_array = content.children;
  for (var i = 1, c = 0; i < content_array.length - 1; i++) {
    try {
      var temp_id_componente = "componente_" + (++c);
      output_data[temp_id_componente] = {
        "id_componente": content_array[i].children[0].innerText.trim(),
        "descripcion": content_array[i].children[1].innerText.trim(),
        "peso": parseFloat(content_array[i].children[2].innerText.trim())
      };
      if (content_array[i].onclick != null) {
        var array_next_element = content_array[++i].children[0].children[0].children[0].children;
        for (var j = 1; j < array_next_element.length; j++) {
          output_data[temp_id_componente]["subcomponente_" + j] = {
            "id_subcomponente": array_next_element[j].children[0].innerText.trim(),
            "descripcion": array_next_element[j].children[1].innerText.trim(),
            "peso": parseFloat(array_next_element[j].children[2].innerText.trim())
          };
        }
      }
    } catch (e) {
      c--;
      continue;
    }
  }
  return JSON.stringify(output_data);
})());

// Extracción de datos Campus UPAO - Módulo Notas por Componente
// Datos de notas
console.log((() => {
  var output_data = {};
  var general = document.getElementById("id_contenido_componentes");
  var content = general.children[1].children[0];
  var title = general.children[0].children[0].children[0].children[0].innerText;
  var split = title.split('-');
  var id_course = split[0].trim() + "-" + split[1].trim();
  output_data[id_course] = {
    promocional: 0
  };
  var content_array = content.children;
  for (var i = 1; i < content_array.length - 1; i++) {
    try {
      var id_componente = content_array[i].children[0].innerText.trim();
      output_data[id_course][id_componente] = {
        "nota": parseFloat(content_array[i].children[3].innerText) | 0
      };
      if (content_array[i].onclick != null) {
        var array_next_element = content_array[++i].children[0].children[0].children[0].children;
        for (var j = 1; j < array_next_element.length; j++) {
          var id_subcomponente = array_next_element[j].children[0].innerText.trim();
          output_data[id_course][id_componente][id_subcomponente] = {
            "nota": parseFloat(array_next_element[j].children[3].innerText) | 0
          };
        }
      }
    } catch (e) {
      continue;
    }
  }
  return JSON.stringify(output_data);
})());