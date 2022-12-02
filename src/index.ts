import { Context, segment } from 'koishi'
import Schema from 'schemastery'

export const name = 'youtube'

export interface Config {
  apiKey: string;
}

export const Config = Schema.object({
  apiKey: Schema.string().default('').required().description('请填写你的youtube api key'),
})

const apiEndpointPrefix = 'https://www.googleapis.com/youtube/v3/videos';

export function apply(ctx: Context, config: Config) {
  function MediaFormat (){
    // http://www.youtube.com/embed/m5yCOSHeYn4
    var ytRegEx = /^(?:https?:\/\/)?(?:i\.|www\.|img\.)?(?:youtu\.be\/|youtube\.com\/|ytimg\.com\/)(?:embed\/|v\/|vi\/|vi_webp\/|watch\?v=|watch\?.+&v=)((\w|-){11})(?:\S+)?$/;
    // http://vimeo.com/3116167, https://player.vimeo.com/video/50489180, http://vimeo.com/channels/3116167, http://vimeo.com/channels/staffpicks/113544877
    var vmRegEx = /https?:\/\/(?:vimeo\.com\/|player\.vimeo\.com\/)(?:video\/|(?:channels\/staffpicks\/|channels\/)|)((\w|-){7,9})/;
    // http://open.spotify.com/track/06TYfe9lyGQA6lfqo5szIi, https://embed.spotify.com/?uri=spotify:track:78z8O6X1dESVSwUPAAPdme
    var spRegEx = /https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:track\/|\?uri=spotify:track:)((\w|-){22})/;
    // https://soundcloud.com/aviciiofficial/avicii-you-make-me-diplo-remix, https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/29395900&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false
    var scRegEx = /https?:\/\/(?:w\.|www\.|)(?:soundcloud\.com\/)(?:(?:player\/\?url=https\%3A\/\/api.soundcloud.com\/tracks\/)|)(((\w|-)[^A-z]{7})|([A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*(?!\/sets(?:\/|$))(?:\/[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*){1,2}))/;
  
    function getIDfromRegEx ( src, regExpy ){
        return (src.match(regExpy)) ? RegExp.$1 : null;
    }
  
    return {
        // returns only the ID
        getYoutubeID: function ( src ){
            return getIDfromRegEx( src, ytRegEx);
        },
        // returns main link
        getYoutubeUrl: function ( ID ){
            return "https://www.youtube.com/watch?v=" + ID;
        },
        // returns only the ID
        getVimeoID: function ( src ){
            return getIDfromRegEx( src, vmRegEx);
        },
        // returns main link
        getVimeoUrl: function ( ID ){
            return "http://vimeo.com/" + ID;
        },
        // returns only the ID
        getSpotifyID: function ( src ){
            return getIDfromRegEx( src, spRegEx);
        },
        // returns main link
        getSpotifyUrl: function ( ID ){
            return "http://open.spotify.com/track/" + ID;
        },
        // returns only the ID
        getSoundcloudID: function ( src ){
            return getIDfromRegEx( src, scRegEx);
        },
        // returns main link
        // NOTE: this one really sucks since soundcloud doesnt have good API without js library
        getSoundcloudUrl: function ( ID ){
            return "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/" + ID; //only way to link to the track currently
        }
    };
  }

  async function fetchDataFromAPI(id: string) {
    return await ctx.http.get(`${apiEndpointPrefix}?id=${id}&key=${config.apiKey}&part=snippet,contentDetails,statistics,status`);
  };

  ctx.middleware(async (session, next, ) => {
    const isYoutube = session.content.includes('youtube.com') || session.content.includes('https://youtu.be')
    if (!isYoutube) return next()
    
    try {
      let id;
      if (session.content.includes('https://youtu.be')) {
        const index = session.content.lastIndexOf("\/");
        id = session.content.substring(index + 1,session.content.length);
      } else {
        id = MediaFormat().getYoutubeID(session.content);
      }
      const result = await fetchDataFromAPI(id);
      const snippet = result.items[0].snippet;
      const {
        title,
        description,
        channelTitle,
        thumbnails,
        publishedAt,
        tags
      } = snippet;
      const thumbnail = await ctx.http.get<ArrayBuffer>(thumbnails.maxres ? thumbnails.maxres.url : thumbnails.high.url , {
        responseType: 'arraybuffer',
      })
      // const descriptionShort = description.length > 100 ? description.substring(0, 99) + '...' : description.length;
      const tagString = tags.length > 1 ? tags.join(', ') : tags[0];
      return `Youtube视频内容解析\n===================\n频道: ${channelTitle}\n标题: ${title}\n发布时间: ${publishedAt}\n标签: ${tagString}\n${segment.image(thumbnail)}`;

    } catch(err) {
      console.log(err);
      return `发生错误!;  ${err}`;
    }
  });
}
