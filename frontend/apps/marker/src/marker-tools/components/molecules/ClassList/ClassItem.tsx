import { ClassIcon } from '@tools/assets';
import { Chip, ChipPropType } from '@tools/components/atoms';
import { ClassType } from '@tools/types/classes';
import { BBOXTOOL, NERTOOL, POLYGONTOOL } from '@tools/types/literal';

type Props = {
  item: ClassType;
} & Pick<ChipPropType, 'onClick' | 'selected'>;

function ClassItem({ item, selected, onClick }: Props) {
  const Icon = (() => {
    switch (item.tool) {
      case BBOXTOOL:
        return <ClassIcon.BboxIcon />;
      case POLYGONTOOL:
        return <ClassIcon.PolygonIcon />;
      case NERTOOL:
        return <ClassIcon.NerIcon />;
    }
  })();

  return (
    <Chip icon={Icon} color={item.color} selected={selected} onClick={onClick}>
      {item.name}
    </Chip>
  );
}

export type { Props as ClassItemPropType };

export default ClassItem;
