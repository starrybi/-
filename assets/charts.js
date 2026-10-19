/* 图表配置层：所有 ECharts option 在此生成，页面只负责承载容器。
   同时兼容浏览器与 Node（Node 端用于 SSR 冒烟测试）。 */
(function (root, factory) {
  var C = factory();
  if (typeof module === 'object' && module.exports) module.exports = C;
  root.CHARTS = C;
})(typeof self !== 'undefined' ? self : globalThis, function () {

  const FONT = '"Microsoft YaHei","PingFang SC","Hiragino Sans GB",system-ui,sans-serif';
  const C = {
    accent: '#1E5EFF', accent2: '#0EA5E9', warm: '#FF7A45', green: '#12B76A',
    red: '#E5484D', purple: '#A855F7', grey: '#94A3B8',
    ink: '#0B1220', ink2: '#5B6B80', ink3: '#94A3B8',
    line: '#E8EDF4', grid: '#F0F3F8', panel: '#FFFFFF'
  };

  const axisLabel = { color: C.ink3, fontSize: 11, fontFamily: FONT };
  const splitLine = { lineStyle: { color: C.grid } };

  function tip(extra) {
    return Object.assign({
      backgroundColor: 'rgba(11,18,32,.93)', borderWidth: 0,
      textStyle: { color: '#fff', fontSize: 12, fontFamily: FONT },
      extraCssText: 'border-radius:8px;padding:8px 12px;'
    }, extra || {});
  }

  const wan = v => (v == null ? '—' : v.toLocaleString('zh-CN', { maximumFractionDigits: 0 }) + ' 万');
  const pct = v => (v == null ? '—' : v.toFixed(2) + '%');

  /* ---------------------------------------------------------- 总览 */
  function overviewPopulation(D) {
    const rows = D.national;
    const years = rows.map(r => String(r.year));
    const vals = rows.map(r => r.population);
    let peak = -1;
    vals.forEach((v, i) => { if (v > (vals[peak] || 0)) peak = i; });

    return {
      textStyle: { fontFamily: FONT },
      grid: { left: 8, right: 24, top: 34, bottom: 6, containLabel: true },
      tooltip: tip({
        trigger: 'axis',
        formatter: p => {
          const r = rows[p[0].dataIndex];
          let s = `<b>${r.year} 年</b><br/>年末人口　<b>${wan(r.population)}</b>`;
          if (r.derived) s += `<br/><span style="color:#FFB020">由 2021 年公报反推</span>`;
          return s;
        }
      }),
      xAxis: {
        type: 'category', data: years, boundaryGap: false,
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisTick: { show: false }, axisLabel
      },
      yAxis: {
        type: 'value', min: 139500, max: 142000, interval: 500,
        splitLine, axisLabel: Object.assign({}, axisLabel, {
          formatter: v => (v / 10000).toFixed(2) + ' 亿'
        })
      },
      series: [{
        name: '年末人口', type: 'line', data: vals,
        smooth: 0.25, symbol: 'circle', symbolSize: 6,
        lineStyle: { width: 3, color: C.accent }, itemStyle: { color: C.accent },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(30,94,255,.20)' },
              { offset: 1, color: 'rgba(30,94,255,0)' }]
          }
        },
        markLine: {
          silent: true, symbol: 'none',
          lineStyle: { type: 'dashed', color: '#A9B6C9' },
          label: {
            formatter: '七普修订口径', color: '#64748B', fontSize: 11,
            position: 'insideStartTop', fontFamily: FONT
          },
          data: [{ xAxis: '2020' }]
        },
        markPoint: peak >= 0 ? {
          symbol: 'circle', symbolSize: 9, itemStyle: { color: C.warm },
          label: {
            formatter: `历史峰值 ${vals[peak].toLocaleString()}`,
            color: C.warm, fontSize: 11, fontWeight: 600,
            position: 'top', distance: 8, fontFamily: FONT
          },
          data: [{ coord: [years[peak], vals[peak]] }]
        } : undefined
      }]
    };
  }

  function overviewRates(D) {
    const rows = D.national.filter(r => r.birth_rate != null);
    const years = rows.map(r => String(r.year));
    return {
      textStyle: { fontFamily: FONT },
      legend: {
        top: 0, right: 0, itemWidth: 9, itemHeight: 9, icon: 'circle',
        textStyle: { color: C.ink2, fontSize: 11, fontFamily: FONT }
      },
      grid: { left: 8, right: 12, top: 34, bottom: 6, containLabel: true },
      tooltip: tip({ trigger: 'axis' }),
      xAxis: {
        type: 'category', data: years, boundaryGap: false,
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisTick: { show: false }, axisLabel
      },
      yAxis: {
        type: 'value', name: '‰', nameTextStyle: { color: C.ink3, fontSize: 11 },
        splitLine, axisLabel: Object.assign({}, axisLabel, { formatter: '{value}' })
      },
      series: [
        {
          name: '出生率', type: 'line', smooth: 0.2,
          data: rows.map(r => r.birth_rate), symbolSize: 5,
          lineStyle: { width: 2.4, color: C.accent }, itemStyle: { color: C.accent }
        },
        {
          name: '死亡率', type: 'line', smooth: 0.2,
          data: rows.map(r => r.death_rate), symbolSize: 5,
          lineStyle: { width: 2.4, color: C.warm }, itemStyle: { color: C.warm },
          markArea: {
            silent: true, itemStyle: { color: 'rgba(229,72,77,.07)' },
            label: {
              show: true, position: 'insideTop', color: C.red, fontSize: 10.5,
              fontFamily: FONT, formatter: '死亡多于出生'
            },
            data: [[{ xAxis: years[years.length - 4] }, { xAxis: years[years.length - 1] }]]
          }
        }
      ]
    };
  }

  function overviewUrban(D) {
    const rows = D.national.filter(r => r.urban_rate != null);
    return {
      textStyle: { fontFamily: FONT },
      grid: { left: 8, right: 16, top: 16, bottom: 6, containLabel: true },
      tooltip: tip({ trigger: 'axis', valueFormatter: v => v + '%' }),
      xAxis: {
        type: 'category', data: rows.map(r => String(r.year)), boundaryGap: false,
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisTick: { show: false }, axisLabel
      },
      yAxis: {
        type: 'value', min: 55, max: 70, splitLine,
        axisLabel: Object.assign({}, axisLabel, { formatter: '{value}%' })
      },
      series: [{
        name: '城镇化率', type: 'line', data: rows.map(r => r.urban_rate),
        smooth: 0.25, symbolSize: 5,
        lineStyle: { width: 2.6, color: C.green }, itemStyle: { color: C.green },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(18,183,106,.20)' },
              { offset: 1, color: 'rgba(18,183,106,0)' }]
          }
        }
      }]
    };
  }

  /* ---------------------------------------------------------- 地图 */
  const POP_PIECES = [
    { lt: 1000, label: '< 1,000 万', color: '#EAF0FF' },
    { gte: 1000, lt: 2000, label: '1,000–2,000', color: '#C3D4FF' },
    { gte: 2000, lt: 3500, label: '2,000–3,500', color: '#9DB8FF' },
    { gte: 3500, lt: 5500, label: '3,500–5,500', color: '#6E93F7' },
    { gte: 5500, lt: 8000, label: '5,500–8,000', color: '#3D6BE5' },
    { gte: 8000, lt: 10000, label: '8,000–10,000', color: '#1E4FC4' },
    { gte: 10000, label: '> 10,000 万', color: '#0F3A9E' }
  ];

  const GROWTH_PIECES = [
    { lt: -300, label: '< −300 万', color: '#A02A2A' },
    { gte: -300, lt: -100, label: '−300 ~ −100', color: '#D06060' },
    { gte: -100, lt: 0, label: '−100 ~ 0', color: '#EDB0A8' },
    { gte: 0, lt: 200, label: '0 ~ +200', color: '#C8D9FF' },
    { gte: 200, lt: 600, label: '+200 ~ +600', color: '#8FAEFF' },
    { gte: 600, lt: 1200, label: '+600 ~ +1,200', color: '#4C7BF0' },
    { gte: 1200, label: '> +1,200 万', color: '#1E4FC4' }
  ];

  const P65_PIECES = [
    { lt: 8, label: '< 8%', color: '#EAF7F0' },
    { gte: 8, lt: 11, label: '8–11%', color: '#B9E6CE' },
    { gte: 11, lt: 13, label: '11–13%', color: '#7FD0A6' },
    { gte: 13, lt: 15, label: '13–15%', color: '#F3CE8A' },
    { gte: 15, lt: 17, label: '15–17%', color: '#F0A65C' },
    { gte: 17, label: '≥ 17%', color: '#E0703A' }
  ];

  function mapOption(D, metric) {
    const pieces = metric === 'delta' ? GROWTH_PIECES
      : metric === 'p65' ? P65_PIECES : POP_PIECES;
    const field = metric === 'delta' ? 'delta'
      : metric === 'p65' ? 'p65_2020' : 'pop2020';

    const data = D.province.map(p => {
      let v = p[field];
      if (v == null) return null;
      if (metric !== 'p65') v = Math.round(v / 1e4);
      return { name: p.name, value: v };
    }).filter(Boolean);

    const unit = metric === 'p65' ? '%' : ' 万';
    return {
      textStyle: { fontFamily: FONT },
      tooltip: tip({
        trigger: 'item',
        formatter: p => {
          const pr = D.province.find(x => x.name === p.name);
          if (!pr || p.value == null || isNaN(p.value))
            return `<b>${p.name}</b><br/><span style="opacity:.7">本次口径未纳入</span>`;
          let s = `<b>${p.name}</b>`;
          s += `<br/>2020 年人口　<b>${wan(pr.pop2020 / 1e4)}</b>`;
          if (pr.pop2010) s += `<br/>2010 年人口　${wan(pr.pop2010 / 1e4)}`;
          if (pr.delta != null) {
            const d = Math.round(pr.delta / 1e4);
            const col = d >= 0 ? '#7FD0A6' : '#F0A65C';
            s += `<br/>十年增减　<b style="color:${col}">${d >= 0 ? '+' : ''}${d.toLocaleString()} 万</b>`;
          }
          if (pr.p65_2020 != null) s += `<br/>65+ 占比　${pr.p65_2020}%`;
          return s;
        }
      }),
      visualMap: {
        type: 'piecewise', pieces, left: 16, bottom: 16,
        itemWidth: 16, itemHeight: 10, itemGap: 6,
        textStyle: { color: C.ink2, fontSize: 10.5, fontFamily: FONT }
      },
      series: [{
        type: 'map', map: 'china', roam: true, zoom: 1.15,
        layoutCenter: ['50%', '50%'], layoutSize: '106%',
        selectedMode: 'single',
        itemStyle: { areaColor: '#F1F4F9', borderColor: '#D8E0EC', borderWidth: 0.7 },
        label: { show: false },
        emphasis: {
          itemStyle: { areaColor: C.warm, borderColor: '#fff', borderWidth: 1.2 },
          label: { show: true, color: '#fff', fontSize: 11, fontWeight: 600,
                   formatter: p => p.name.replace(/(维吾尔|回族|壮族|自治区|特别行政区|省|市)/g, '') }
        },
        select: {
          itemStyle: { areaColor: '#0B3FCC', borderColor: '#fff', borderWidth: 1.4 },
          label: { show: true, color: '#fff', fontSize: 11, fontWeight: 600,
                   formatter: p => p.name.replace(/(维吾尔|回族|壮族|自治区|特别行政区|省|市)/g, '') }
        },
        data
      }]
    };
  }

  function top10Option(D) {
    const top = D.province.slice().sort((a, b) => a.pop2020 - b.pop2020).slice(-10);
    return {
      textStyle: { fontFamily: FONT },
      grid: { left: 6, right: 66, top: 8, bottom: 4, containLabel: true },
      xAxis: { type: 'value', show: false, max: 14000 },
      yAxis: {
        type: 'category',
        data: top.map(p => p.short),
        axisLine: { show: false }, axisTick: { show: false },
        axisLabel: { color: C.ink2, fontSize: 11, fontFamily: FONT }
      },
      tooltip: tip({
        trigger: 'item',
        formatter: p => {
          const pr = D.province.find(x => x.short === p.name);
          return `<b>${pr.name}</b><br/>2020 年常住人口 <b>${wan(pr.pop2020 / 1e4)}</b>` +
                 `<br/>占全国 ${pr.share2020}%` +
                 (pr.p65_2020 != null ? `<br/>65+ 占比 ${pr.p65_2020}%` : '');
        }
      }),
      series: [{
        type: 'bar', barWidth: '58%',
        data: top.map(p => Math.round(p.pop2020 / 1e4)),
        itemStyle: {
          borderRadius: [0, 5, 5, 0],
          color: {
            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#8FAEFF' },
              { offset: 1, color: '#1E5EFF' }]
          }
        },
        label: {
          show: true, position: 'right', color: C.ink, fontSize: 10.5,
          fontWeight: 600, fontFamily: FONT, formatter: '{c}'
        }
      }]
    };
  }

  /* ---------------------------------------------------------- 结构 */
  function ageCompare(D) {
    const g = D.structure;
    const cats = ['0–14 岁', '15–59 岁', '60 岁及以上'];
    const pick = s => [s.age014_pct, s.age1559_pct, s.age60_pct];
    return {
      textStyle: { fontFamily: FONT },
      legend: {
        top: 0, right: 0, itemWidth: 9, itemHeight: 9, icon: 'circle',
        textStyle: { color: C.ink2, fontSize: 11, fontFamily: FONT }
      },
      grid: { left: 8, right: 12, top: 36, bottom: 6, containLabel: true },
      tooltip: tip({ trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: v => v + '%' }),
      xAxis: {
        type: 'category', data: cats,
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisTick: { show: false },
        axisLabel: Object.assign({}, axisLabel, { fontSize: 11.5 })
      },
      yAxis: {
        type: 'value', max: 80, splitLine,
        axisLabel: Object.assign({}, axisLabel, { formatter: '{value}%' })
      },
      series: [
        { name: '2010 六普', type: 'bar', barGap: '18%', data: pick(g.y2010),
          itemStyle: { color: '#C9D4E4', borderRadius: [4, 4, 0, 0] } },
        { name: '2020 七普', type: 'bar', data: pick(g.y2020),
          itemStyle: { color: '#7C9CF5', borderRadius: [4, 4, 0, 0] } },
        { name: '2025 抽样', type: 'bar', data: pick(g.y2025),
          itemStyle: { color: C.accent, borderRadius: [4, 4, 0, 0] },
          label: {
            show: true, position: 'top', color: C.accent, fontSize: 11,
            fontWeight: 600, fontFamily: FONT, formatter: '{c}%'
          } }
      ]
    };
  }

  function sexCompare(D) {
    const g = D.structure;
    const rows = [g.y2010, g.y2020, g.y2025];
    return {
      textStyle: { fontFamily: FONT },
      legend: {
        top: 0, left: 'center', itemWidth: 9, itemHeight: 9, icon: 'circle',
        textStyle: { color: C.ink2, fontSize: 11, fontFamily: FONT }
      },
      grid: { left: 8, right: 16, top: 32, bottom: 6, containLabel: true },
      tooltip: tip({ trigger: 'axis', valueFormatter: v => v + '%' }),
      xAxis: {
        type: 'value', max: 100, splitLine,
        axisLabel: Object.assign({}, axisLabel, { formatter: '{value}%' })
      },
      yAxis: {
        type: 'category', data: rows.map(r => r.year + ' 年'),
        axisLine: { show: false }, axisTick: { show: false },
        axisLabel: Object.assign({}, axisLabel, { fontSize: 11.5 })
      },
      series: [
        { name: '男性', type: 'bar', stack: 'sex', barWidth: '46%',
          data: rows.map(r => r.male_pct),
          itemStyle: { color: '#4C7BF0', borderRadius: [4, 0, 0, 4] },
          label: { show: true, position: 'inside', color: '#fff', fontSize: 10.5,
                   fontFamily: FONT, formatter: p => p.value + '%' } },
        { name: '女性', type: 'bar', stack: 'sex',
          data: rows.map(r => r.female_pct),
          itemStyle: { color: '#F0A6C0', borderRadius: [0, 4, 4, 0] } }
      ]
    };
  }

  function urbanCompare(D) {
    const g = D.structure;
    const rows = [{ y: 2020, u: g.y2020.urban_pct, r: g.y2020.rural_pct },
                  { y: 2025, u: g.y2025.urban_pct, r: g.y2025.rural_pct }];
    return {
      textStyle: { fontFamily: FONT },
      legend: {
        top: 0, left: 'center', itemWidth: 9, itemHeight: 9, icon: 'circle',
        textStyle: { color: C.ink2, fontSize: 11, fontFamily: FONT }
      },
      grid: { left: 8, right: 16, top: 32, bottom: 6, containLabel: true },
      tooltip: tip({ trigger: 'axis', valueFormatter: v => v + '%' }),
      xAxis: {
        type: 'value', max: 100, splitLine,
        axisLabel: Object.assign({}, axisLabel, { formatter: '{value}%' })
      },
      yAxis: {
        type: 'category', data: rows.map(r => r.y + ' 年'),
        axisLine: { show: false }, axisTick: { show: false },
        axisLabel: Object.assign({}, axisLabel, { fontSize: 11.5 })
      },
      series: [
        { name: '城镇', type: 'bar', stack: 'u', barWidth: '46%',
          data: rows.map(r => r.u),
          itemStyle: { color: C.accent, borderRadius: [4, 0, 0, 4] },
          label: { show: true, position: 'inside', color: '#fff', fontSize: 11,
                   fontWeight: 600, fontFamily: FONT, formatter: p => p.value + '%' } },
        { name: '乡村', type: 'bar', stack: 'u',
          data: rows.map(r => r.r),
          itemStyle: { color: '#B8C4D6', borderRadius: [0, 4, 4, 0] } }
      ]
    };
  }

  function education2025(D) {
    const s = D.structure.y2025;
    const cats = ['大学及以上', '高中', '初中', '小学'];
    const vals = [s.college, s.highschool, s.junior, s.primary];
    return {
      textStyle: { fontFamily: FONT },
      grid: { left: 6, right: 56, top: 8, bottom: 4, containLabel: true },
      xAxis: { type: 'value', show: false, max: 50000 },
      yAxis: {
        type: 'category', data: cats,
        axisLine: { show: false }, axisTick: { show: false },
        axisLabel: Object.assign({}, axisLabel, { fontSize: 11.5 })
      },
      tooltip: tip({ trigger: 'item', valueFormatter: v => v.toLocaleString() + ' 万人' }),
      series: [{
        type: 'bar', barWidth: '50%',
        data: vals,
        itemStyle: { color: '#5C86F0', borderRadius: [0, 5, 5, 0] },
        label: {
          show: true, position: 'right', color: C.ink, fontSize: 10.5,
          fontWeight: 600, fontFamily: FONT,
          formatter: p => p.value.toLocaleString() + ' 万'
        }
      }]
    };
  }

  function prov65Rank(D) {
    const top = D.province.filter(p => p.p65_2020 != null)
      .sort((a, b) => a.p65_2020 - b.p65_2020).slice(-10);
    return {
      textStyle: { fontFamily: FONT },
      grid: { left: 6, right: 56, top: 8, bottom: 4, containLabel: true },
      xAxis: { type: 'value', show: false, min: 0, max: 22 },
      yAxis: {
        type: 'category', data: top.map(p => p.short),
        axisLine: { show: false }, axisTick: { show: false },
        axisLabel: Object.assign({}, axisLabel, { fontSize: 11 })
      },
      tooltip: tip({ trigger: 'item', valueFormatter: v => v + '%' }),
      series: [{
        type: 'bar', barWidth: '56%',
        data: top.map(p => p.p65_2020),
        itemStyle: {
          borderRadius: [0, 5, 5, 0],
          color: {
            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#F6C89A' },
              { offset: 1, color: '#E0703A' }]
          }
        },
        label: {
          show: true, position: 'right', color: C.ink, fontSize: 10.5,
          fontWeight: 600, fontFamily: FONT, formatter: '{c}%'
        }
      }]
    };
  }

  /* ---------------------------------------------------------- 国际 */
  const CN = { CHN: '中国', JPN: '日本', KOR: '韩国', IND: '印度', USA: '美国' };
  const CN_COLOR = { CHN: C.accent, JPN: C.warm, KOR: C.green, IND: C.purple, USA: C.grey };

  function yearsOf(obj) {
    const ys = Object.keys(obj || {}).map(Number).filter(y => y >= 1990 && y <= 2024);
    return ys.sort((a, b) => a - b);
  }

  function globalAging(D) {
    const d = D.worldbank.p65 || {};
    const years = yearsOf(d.CHN);
    const series = Object.keys(CN).filter(k => d[k]).map(k => ({
      name: CN[k], type: 'line', smooth: 0.2, symbol: 'circle', symbolSize: 4,
      showSymbol: false,
      data: years.map(y => d[k][y] != null ? +d[k][y].toFixed(2) : null),
      lineStyle: { width: k === 'CHN' ? 3 : 2, color: CN_COLOR[k] },
      itemStyle: { color: CN_COLOR[k] },
      emphasis: { focus: 'series' },
      z: k === 'CHN' ? 4 : 2
    }));
    return {
      textStyle: { fontFamily: FONT },
      color: Object.values(CN_COLOR),
      legend: {
        top: 0, left: 0, itemWidth: 9, itemHeight: 9, icon: 'circle', itemGap: 18,
        textStyle: { color: C.ink2, fontSize: 11.5, fontFamily: FONT }
      },
      grid: { left: 10, right: 30, top: 38, bottom: 8, containLabel: true },
      tooltip: tip({ trigger: 'axis', order: 'valueDesc', valueFormatter: v => v + '%' }),
      xAxis: {
        type: 'category', data: years.map(String), boundaryGap: false,
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisTick: { show: false },
        axisLabel: Object.assign({}, axisLabel, { interval: 9 })
      },
      yAxis: {
        type: 'value', splitLine,
        axisLabel: Object.assign({}, axisLabel, { formatter: '{value}%' })
      },
      series
    };
  }

  function globalTFR(D) {
    const d = D.worldbank.tfr || {};
    const keys = Object.keys(CN).filter(k => d[k] && d[k]['2024'] != null);
    const rows = keys.map(k => ({ k, v: d[k]['2024'] })).sort((a, b) => a.v - b.v);
    return {
      textStyle: { fontFamily: FONT },
      grid: { left: 6, right: 62, top: 10, bottom: 4, containLabel: true },
      xAxis: { type: 'value', show: false, max: 2.6 },
      yAxis: {
        type: 'category', data: rows.map(r => CN[r.k]),
        axisLine: { show: false }, axisTick: { show: false },
        axisLabel: Object.assign({}, axisLabel, { fontSize: 11.5 })
      },
      tooltip: tip({ trigger: 'item', valueFormatter: v => v.toFixed(2) }),
      series: [{
        type: 'bar', barWidth: '48%',
        data: rows.map(r => ({ value: r.v, itemStyle: { color: CN_COLOR[r.k], borderRadius: [0, 5, 5, 0] } })),
        label: {
          show: true, position: 'right', color: C.ink, fontSize: 11,
          fontWeight: 600, fontFamily: FONT, formatter: p => p.value.toFixed(2)
        },
        markLine: {
          silent: true, symbol: 'none',
          lineStyle: { color: C.red, type: 'dashed', width: 1.2 },
          label: {
            formatter: '更替水平 2.1', color: C.red, fontSize: 10.5,
            position: 'end', fontFamily: FONT
          },
          data: [{ xAxis: 2.1 }]
        }
      }]
    };
  }

  function globalPop(D) {
    const d = D.worldbank.pop || {};
    const years = yearsOf(d.CHN);
    const series = Object.keys(CN).filter(k => d[k]).map(k => ({
      name: CN[k], type: 'line', smooth: 0.2, showSymbol: false,
      data: years.map(y => d[k][y] != null ? +(d[k][y] / 1e8).toFixed(3) : null),
      lineStyle: { width: k === 'CHN' ? 3 : 2, color: CN_COLOR[k] },
      itemStyle: { color: CN_COLOR[k] },
      emphasis: { focus: 'series' }
    }));
    return {
      textStyle: { fontFamily: FONT },
      legend: {
        top: 0, left: 0, itemWidth: 9, itemHeight: 9, icon: 'circle', itemGap: 18,
        textStyle: { color: C.ink2, fontSize: 11.5, fontFamily: FONT }
      },
      grid: { left: 10, right: 26, top: 38, bottom: 8, containLabel: true },
      tooltip: tip({ trigger: 'axis', valueFormatter: v => v + ' 亿' }),
      xAxis: {
        type: 'category', data: years.map(String), boundaryGap: false,
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisTick: { show: false },
        axisLabel: Object.assign({}, axisLabel, { interval: 9 })
      },
      yAxis: {
        type: 'value', splitLine,
        axisLabel: Object.assign({}, axisLabel, { formatter: '{value} 亿' })
      },
      series
    };
  }

  return {
    C, wan, pct,
    overviewPopulation, overviewRates, overviewUrban,
    mapOption, top10Option,
    ageCompare, sexCompare, urbanCompare, education2025, prov65Rank,
    globalAging, globalTFR, globalPop
  };
});
