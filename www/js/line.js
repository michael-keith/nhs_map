function generate_chart(div, id, type) {

  let width = document.getElementById(div).offsetWidth;
  let height = 170;
  c3.generate({
    padding: {
      right: 10
    },
    bindto: "#" + div,
    data: {
      x: 'x',
      columns: [
        lines[id][type]["dates"],
        lines[id][type]["totals"]
      ],
      types: {
        total: 'area',
      }
    },
    legend: {
      show: false
    }, tooltip:{show:false},
    axis: {
      x: {
        show: true,
        type : 'area',
        padding: 0,
        tick: {
          format: function (d) {
            return d % 2 == 0 ? d : "";
          },
          rotate: -90,
        },
      },
      y: {
        show:true,
        min: 0,
        padding: 0,
        tick: {
          format: function (d) {
            return d % 2 == 0 ? d : "";
          },
          outer: false

        },
      }
    }, size: {height:height, width:width},     point: {
      show: false
    },
    color: {
      pattern: ['#CCC']
    }
  });

}
