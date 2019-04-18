// Extracción de datos Campus UPAO - Módulo Reporte de notas
console.log((function extract_data_Mod_Rep_Not() {
  var general = document.getElementById("lst_registrados_inig");
  var content = general.children[1].children[0].children;
  var alumno = document.getElementById("ctl00_lbl_usua").innerText.trim().split('    ');
  var output_data = {};
  output_data[alumno[0]] = {
    "apellidos_nombres": alumno[1],
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
console.log(function extract_data_Mod_Not_Comp() {
  var output_data = {};
  var general = document.getElementById("id_contenido_componentes");
  var content = general.children[1].children[0];
  var title = general.children[0].children[0].children[0].children[0].innerText;
  var split = title.split('-');
  var id_curso = split[0].trim() + "-" + split[1].trim();
  output_data[id_curso] = {
    "nombre": split[2].trim()
  };
  var content_array = content.children;
  for (var i = 1; i < content_array.length - 1; i++) {
    try {
      var element = content_array[i];
      var id_componente = element.children[0].innerText.trim();
      output_data[id_curso][id_componente] = {
        "descripcion": element.children[1].innerText.trim(),
        "peso": parseFloat(element.children[2].innerText.trim()),
        "nota": parseFloat(element.children[3].innerText) | 0
      };
      if (element.onclick != null) {
        var array_next_element = content_array[++i].children[0].children[0].children[0].children;
        for (var j = 1; j < array_next_element.length; j++) {
          var sub_element = array_next_element[j];
          output_data[id_curso][id_componente][sub_element.children[0].innerText.trim()] = {
            "descripcion": sub_element.children[1].innerText.trim(),
            "peso": parseFloat(sub_element.children[2].innerText.trim()),
            "nota": parseFloat(sub_element.children[3].innerText) | 0
          };
        }
      }
    } catch (e) {
      continue;
    }
  }
  return JSON.stringify(output_data);
}());