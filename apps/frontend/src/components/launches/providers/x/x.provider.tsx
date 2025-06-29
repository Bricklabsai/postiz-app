import { withProvider } from '@gitroom/frontend/components/launches/providers/high.order.provider';
import { ThreadFinisher } from '@gitroom/frontend/components/launches/finisher/thread.finisher';
import { Select } from '@gitroom/react/form/select';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { useSettings } from '@gitroom/frontend/components/launches/helpers/use.values';

const whoCanReply = [
  {
    label: 'Everyone',
    value: 'everyone',
  },
  {
    label: 'Accounts you follow',
    value: 'following',
  },
  {
    label: 'Mentioned accounts',
    value: 'mentionedUsers',
  },
  {
    label: 'Subscribers',
    value: 'subscribers',
  },
  {
    label: 'Verified accounts',
    value: 'verified',
  }
]

const SettingsComponent = () => {
  const t = useT();
  const { register, watch, setValue } = useSettings();

  return (
    <>
      <Select
        label={t('label_who_can_reply_to_this_post', 'Who can reply to this post?')}
        className="mb-5"
        hideErrors={true}
        {...register('who_can_reply_post', {
          value: 'everyone',
        })}
      >
        {whoCanReply.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </Select>

      <ThreadFinisher />
    </>
  );
};

export default withProvider(
  SettingsComponent,
  undefined,
  undefined,
  async (posts) => {
    if (posts.some((p) => p.length > 4)) {
      return 'There can be maximum 4 pictures in a post.';
    }
    if (
      posts.some(
        (p) => p.some((m) => m.path.indexOf('mp4') > -1) && p.length > 1
      )
    ) {
      return 'There can be maximum 1 video in a post.';
    }
    for (const load of posts.flatMap((p) => p.flatMap((a) => a.path))) {
      if (load.indexOf('mp4') > -1) {
        const isValid = await checkVideoDuration(load);
        if (!isValid) {
          return 'Video duration must be less than or equal to 140 seconds.';
        }
      }
    }
    return true;
  },
  (settings) => {
    if (settings?.[0]?.value) {
      return 4000;
    }
    return 280;
  }
);
const checkVideoDuration = async (url: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = url;
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      // Check if the duration is less than or equal to 140 seconds
      const duration = video.duration;
      if (duration <= 140) {
        resolve(true); // Video duration is acceptable
      } else {
        resolve(false); // Video duration exceeds 140 seconds
      }
    };
    video.onerror = () => {
      reject(new Error('Failed to load video metadata.'));
    };
  });
};
