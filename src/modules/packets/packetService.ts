import { LearningPacket, Lesson, SubjectId } from '../../types/domain';
import { storageService } from '../storage/storageService';

export const SAMPLE_PACKETS: LearningPacket[] = [
  {
    id: 'pkt-math-core-v1',
    title: 'Grade 6–8 Mathematics Core Bundle',
    subjectId: 'math',
    lessonIds: ['math-fractions-01', 'math-ratios-02', 'math-geometry-03', 'math-algebra-04'],
    version: '1.0.0',
    totalSizeKB: 679,
    createdAt: '2026-01-18T09:00:00.000Z',
    status: 'cached_offline',
    origin: 'sample',
  },
  {
    id: 'pkt-science-core-v1',
    title: 'Grade 6–8 Science Foundation Bundle',
    subjectId: 'science',
    lessonIds: [
      'sci-photosynthesis-01',
      'sci-circuits-02',
      'sci-water-03',
      'sci-matter-04',
    ],
    version: '1.0.0',
    totalSizeKB: 684,
    createdAt: '2026-01-18T09:30:00.000Z',
    status: 'cached_offline',
    origin: 'sample',
  },
];

class PacketService {
  async getAllPackets(): Promise<LearningPacket[]> {
    const adapter = await storageService.getAdapter();
    const localPackets = await adapter.getAll<LearningPacket>('packets');
    return [...SAMPLE_PACKETS, ...localPackets];
  }

  async createLocalPacket(
    title: string,
    subjectId: SubjectId,
    lessons: Lesson[]
  ): Promise<LearningPacket> {
    const adapter = await storageService.getAdapter();
    const totalSizeKB = lessons.reduce((sum, l) => sum + l.sizeKB, 0);
    const packet: LearningPacket = {
      id: `pkt-local-${Date.now()}`,
      title: title.trim(),
      subjectId,
      lessonIds: lessons.map((l) => l.id),
      version: '1.0.0-local',
      totalSizeKB,
      createdAt: new Date().toISOString(),
      status: 'staged_local',
      origin: 'local',
    };
    await adapter.put('packets', packet.id, packet);
    return packet;
  }

  exportPacketManifestAsJson(packet: LearningPacket, lessons: Lesson[]): void {
    const includedLessons = lessons.filter((l) => packet.lessonIds.includes(l.id));
    const manifestPayload = {
      schema: 'pathweave.learning-packet.v1',
      exportedAt: new Date().toISOString(),
      packet,
      lessons: includedLessons,
    };
    const blob = new Blob([JSON.stringify(manifestPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${packet.id}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }
}

export const packetService = new PacketService();
