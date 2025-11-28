const axios = require("axios")
const cheerio = require("cheerio")

class Mcpedl {
  constructor() {
    this.baseURL = "https://mcpedl.org";
    this.is = axios.create({
      baseURL: this.baseURL,
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 16; NX729J) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.7271.123 Mobile Safari/537.36",
      }
    });
  }
  
  async search(query, page = 1) {
    try {
      const { data } = await this.is.get(`/page/${page}/`, {
        params: { s: query }
      });
      const $ = cheerio.load(data);
      const list = []
      const n = $('a.next')
      $('.entries .g-grid .g-block article section').each((i, el) => {
        if ($(el).find('a').attr('href')) {
          list.push({
            name: $(el).find('h2 a').text(),
            id: $(el).find('a').attr('href').split("/").at(-2),
            img: $(el).find('img').attr('src'),
            rating: $(el).find('.rating-wrapper span').text().trim()
          })
        }
      })
      return {
        list,
        hasNextPage: !!n.attr('href'),
        nextPage: !!n.attr('href') ? n.attr('href').split("/").at(-2) : null,
      }
    } catch (err) {
      return this._handleError(err);
    }
  }
  
  async detail(id) {
    try {
      const r = await this.is.get(`/${id}`);
      const $ = cheerio.load(r.data);
      
      const [list, gallery, faq, info] = [[], [], [], {
        category: $('.categories .single-cat').text().trim(),
        postDate: $('.date').attr('content') || $('.date').text().trim(),
        author: $('.meta-author-link .author').text().trim()
      }]
      
      $("section#download-link table tbody tr").each((_, el) => {
        list.push({
          name: $(el).find('td:eq(1)').text(),
          nn: $(el).find('td > form').attr('action').split('/')?.[2],
        })
      })
      $('.entry-gallery div div div').each((_, el) => {
        const ty = el.attribs?.itemtype?.includes('Video') ? 'video' : 'image'
        gallery.push({
          type: ty,
          img: $(el).find('img').attr('src'),
          ...(ty == 'video' ? {
            name: $(el).find('[itemprop="name"]').attr('content') || '',
            postTime: $(el).find('[itemprop="uploadDate"]').attr('content') || '',
            duration: $(el).find('[itemprop="duration"]').attr('content') || null,
            video: $(el).find('a[itemprop="embedUrl"]').attr('onclick')?.match(/src: '(.*?)'/)?.[1] || null,
          } : {})
        })
      })
      $('#faqs div details').each((_, el) => {
        faq.push({
          question: $(el).find('summary h3').text(),
          answer: $(el).find('div p').text()
        })
      })
      $('.entry-footer-column').each((_, el) => {
        const cdiv = $(el).find('.entry-footer-content')
        let label = cdiv.find('div').first().text().trim().replace(':', '')
        let value = cdiv.find('span').last().text().trim()
        if (!label) {
          label = cdiv.contents().filter(function(){ return this.type === 'text' }).text().trim().replace(':', '')
        }
        if (label && value) {
          const key = label.toLowerCase().replace(/\s+/g, '_');
          if (!['categories', 'publication_date', 'author'].includes(key)) {
             info[key] = value
          }
          if (label === "Author" && info.postAuthor && value !== info.postAuthor) {
            info['game_author'] = value
          }
        }
      })
      
      return {
        title: $('.entry-title').text().trim(),
        img: $('.post-thumbnail img').attr('src'),
        rating: {
          count: $('span[itemprop="ratingCount"]').text(),
          value: $('span[itemprop="ratingValue"]').text(),
        },
        comment: $('span.comment-count').text(),
        content: $('section.entry-content div').text().trim(),
        info,
        gallery,
        faq,
        list: this._parseTable($)
      };
    } catch (err) {
      return this._handleError(err);
    }
  }
  
  async download(id) {
    try {
      const dlResponse = await this.is.get(`/dw_file.php`, {
        params: { id: id }
      });
      const $ = cheerio.load(dlResponse.data);
      return {
        url: $("a").attr("href")
      };
    } catch (err) {
      return this._handleError(err);
    }
  }
  
  async mclatest(page = 1) {
    try {
      const w = await this.is.get(`/downloading/page/${page}/`);
      const $ = cheerio.load(w.data);
      const [quick, list] = [[], []]
      
      $('.archive .dwbuttonslist div[style*="solid"]').each((i, el) => {
        if ($(el).find('a').attr('href')) {
          quick.push({
            name: $(el).find('span[style*="font-weight: 900"]').text(),
            id: $(el).find('div a').attr('href')?.replace(/\//g, ''),
            file: parseInt($(el).find('form').attr('action').split('/')?.[2])
          })
        }
      })
      $('.entries .g-grid .g-block article section').each((i, el) => {
        if ($(el).find('a').attr('href')) {
          list.push({
            name: $(el).find('h2 a').text(),
            id: $(el).find('a').attr('href').split("/").at(-2),
            img: $(el).find('img').attr('src'),
            rating: $(el).find('.rating-wrapper span').text().trim()
          })
        }
      })
      
      return {
        quick,
        list
      };
    } catch (err) {
      return this._handleError(err);
    }
  }
  
  _parseTable($, rs = []) {
    $('#download-link table tbody tr').each((j, el) => {
      let [tds, nm, vr, fc, fl] = [$(el).find('td'), null, null, '', []]
      if (tds.length === 3) {
        nm = $(tds[0]).text().trim();
        vr = $(tds[1]).text().trim();
        fc = $(tds[2]);
      } else if (tds.length === 2) {
        nm = $(tds[0]).text().trim();
        vr = "N/A";
        fc = $(tds[1]);
      }
      if (fc) {
        fc.find('form').each((i, ef) => fl.push({
          index: i+1,
          type: $(ef).find('button').text().replace(/\s+/g, ' ').trim(),
          id: parseInt( $(ef).attr('action').split('/')?.[2]),
          meta_title: $(ef).find('input[name="post_title"]').val() || null
        }))
      }

      rs.push({
        index: j+1,
        name: nm,
        version: vr,
        files: fl
      })
    })
    return rs
  }
  
  _handleError(err) {
    if (err?.response?.status === 404) {
      return {
        error: true,
        message: "Page Not Found"
      };
    }
    throw err;
  }
}
